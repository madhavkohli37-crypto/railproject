import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitBooking, notifyUsers } from '@/lib/realtime';

const allowed = ['ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED_BY_PROVIDER'];

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const bookingId = Number((await params).id);
  try {
    const { status, otp, reason } = await req.json();
    if (!allowed.includes(status)) return NextResponse.json({ error: `Status must be one of ${allowed.join(', ')}` }, { status: 400 });
    if (status === 'CANCELLED_BY_PROVIDER' && (!reason || reason.trim().length < 3)) return NextResponse.json({ error: 'A cancellation reason is required' }, { status: 400 });
    const db = await getDB();
    const booking = await db.collection('bookings').findOne({ id: bookingId, 'services.provider_id': decoded.userId });
    if (!booking) return NextResponse.json({ error: 'You are not assigned to this booking' }, { status: 403 });
    const service = booking.services.find(s => s.provider_id === decoded.userId);
    if (status === 'STARTED') {
      if (service.status !== 'ARRIVED' || !otp) return NextResponse.json({ error: 'Provider must arrive and receive the passenger OTP first' }, { status: 409 });
      const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
      const started = await db.collection('bookings').findOneAndUpdate(
        { id: bookingId, otp_used: false, otp_hash: hash, services: { $elemMatch: { provider_id: decoded.userId, status: 'ARRIVED' } } },
        { $set: { 'services.$.status': 'STARTED', 'services.$.start_time': new Date().toISOString(), otp_used: true, status: 'STARTED', updated_at: new Date().toISOString() } },
        { returnDocument: 'after' }
      );
      const updated = started?.value || started;
      if (!updated) return NextResponse.json({ error: 'Invalid or already used OTP' }, { status: 409 });
      const event = status === 'ARRIVED' ? 'provider:arrived' : status === 'STARTED' ? 'booking:started' : status === 'COMPLETED' ? 'booking:completed' : status === 'CANCELLED_BY_PROVIDER' ? 'booking:cancelled' : 'booking:updated';
      emitBooking(updated, event);
      await notifyUsers(
        [updated.user_id, decoded.userId],
        'Service started',
        'Your provider verified the OTP and started the service.',
        { booking_id: bookingId, status: 'STARTED' }
      );
      const { otp_hash, otp_code, ...safeBooking } = updated;
      return NextResponse.json({ message: 'Service started', booking: safeBooking });
    }

    const now = new Date().toISOString();
    const set = { updated_at: now };
    if (status === 'ARRIVED') {
      set['services.$.status'] = 'ARRIVED';
      set['services.$.arrived_at'] = now;
      set.status = 'ARRIVED';
    } else if (status === 'COMPLETED') {
      if (service.status !== 'STARTED') return NextResponse.json({ error: 'Service must be STARTED after OTP verification' }, { status: 409 });
      set['services.$.status'] = 'COMPLETED';
      set['services.$.check_out_time'] = now;
      set.status = booking.services.every(s => s.provider_id === decoded.userId ? s.status === 'STARTED' : ['COMPLETED', 'CANCELLED'].includes(s.status)) ? 'COMPLETED' : 'IN_PROGRESS';
    } else {
      set['services.$.status'] = 'REQUESTED';
      set['services.$.provider_id'] = null;
      set['services.$.provider_name'] = null;
      set['services.$.provider_phone'] = null;
      set['services.$.cancellation_reason'] = reason.trim();
      set.status = 'SEARCHING';
    }
    const updatedResult = await db.collection('bookings').findOneAndUpdate(
      { id: bookingId, services: { $elemMatch: { provider_id: decoded.userId, ...(status === 'ARRIVED' ? { status: { $in: ['ACCEPTED', 'ARRIVED'] } } : {}) } } },
      { $set: set },
      { returnDocument: 'after' }
    );
    const updated = updatedResult?.value || updatedResult;
    if (!updated) return NextResponse.json({ error: 'Booking changed; refresh and try again' }, { status: 409 });
    if (status === 'COMPLETED' || status === 'CANCELLED_BY_PROVIDER') {
      const update = { $set: { available: true, provider_status: 'ONLINE' } };
      if (status === 'COMPLETED') update.$inc = { earnings: service.price || 0, completed_jobs: 1 };
      await db.collection('users').updateOne({ id: decoded.userId }, update);
    }
    emitBooking(updated);
    const title = status === 'CANCELLED_BY_PROVIDER' ? 'Provider cancelled — rematching' : `Service ${status.toLowerCase()}`;
    const message = status === 'CANCELLED_BY_PROVIDER'
      ? `Your provider cancelled: ${reason}. We are looking for another provider.`
      : `Your provider marked the service ${status.toLowerCase()}.`;
    await notifyUsers(
      [updated.user_id, decoded.userId],
      title,
      message,
      { booking_id: bookingId, status, reason: reason || null }
    );
    const { otp_hash, otp_code, ...safeBooking } = updated;
    return NextResponse.json({ message: 'Job status updated', status, booking: safeBooking });
  } catch (err) {
    console.error('Update job status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
