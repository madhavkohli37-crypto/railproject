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
    const body = await req.json();
    const { status, otp, reason } = body;
    if (!allowed.includes(status)) return NextResponse.json({ error: `Status must be one of ${allowed.join(', ')}` }, { status: 400 });
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const normalizedReason = typeof reason === 'string' ? reason.trim() : '';
    if (status === 'CANCELLED_BY_PROVIDER' && (!normalizedReason || (normalizedReason === 'Other' && !description))) {
      return NextResponse.json({ error: 'Please select a cancellation reason. A custom reason is required when Other is selected.' }, { status: 400 });
    }
    const db = await getDB();
    const booking = await db.collection('bookings').findOne({
      id: bookingId,
      'services.provider_id': decoded.userId,
    });
    if (!booking) return NextResponse.json({ error: 'You are not assigned to this booking' }, { status: 403 });
    if (['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(booking.status)) {
      return NextResponse.json({ error: `This booking is already ${booking.status.toLowerCase().replace(/_/g, ' ')}. No further actions are allowed.` }, { status: 409 });
    }
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
      set['services.$.status'] = 'CANCELLED';
      set['services.$.cancellation_reason'] = normalizedReason;
      set['services.$.cancellation_description'] = description;
      set['services.$.cancelled_at'] = now;
      set['services.$.cancelled_by'] = 'SERVICE_PROVIDER';
      set.cancellation_reason = normalizedReason;
      set.cancellation_description = description;
      set.cancelled_at = now;
      set.cancelled_by = 'SERVICE_PROVIDER';
      set.status = 'CANCELLED';
    }
    const updatedResult = await db.collection('bookings').findOneAndUpdate(
      { id: bookingId, status: { $nin: ['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'] }, services: { $elemMatch: { provider_id: decoded.userId, ...(status === 'ARRIVED' ? { status: { $in: ['ACCEPTED', 'ARRIVED'] } } : {}) } } },
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
    emitBooking(updated, status === 'CANCELLED_BY_PROVIDER' ? 'booking:cancelled' : 'booking:updated');
    const title = status === 'CANCELLED_BY_PROVIDER' ? 'Booking cancelled' : `Service ${status.toLowerCase()}`;
    const message = status === 'CANCELLED_BY_PROVIDER'
      ? `Your service provider cancelled booking #${bookingId}: ${normalizedReason}${description ? ` — ${description}` : ''}`
      : `Your provider marked the service ${status.toLowerCase()}.`;
    await notifyUsers(
      [updated.user_id, decoded.userId],
      title,
      message,
      { booking_id: bookingId, status: status === 'CANCELLED_BY_PROVIDER' ? 'CANCELLED' : status, reason: normalizedReason || null, description, cancelled_by: 'SERVICE_PROVIDER', cancelled_at: status === 'CANCELLED_BY_PROVIDER' ? now : null }
    );
    if (status === 'CANCELLED_BY_PROVIDER') {
      await db.collection('audit_logs').insertOne({
        action: 'BOOKING_CANCELLED',
        actor_id: decoded.userId,
        booking_id: bookingId,
        timestamp: now,
        details: JSON.stringify({ reason: normalizedReason, description, cancelled_by: 'SERVICE_PROVIDER', cancelled_at: now }),
      });
    }
    const { otp_hash, otp_code, ...safeBooking } = updated;
    return NextResponse.json({ message: 'Job status updated', status, booking: safeBooking });
  } catch (err) {
    console.error('Update job status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
