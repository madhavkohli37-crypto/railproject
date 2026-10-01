import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitBooking, emitRealtime, notifyUsers } from '@/lib/realtime';

export async function POST(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const bookingId = Number((await params).id);
  try {
    const { service_type } = await req.json();
    if (!['PORTER', 'WHEELCHAIR', 'MEET_AND_GREET'].includes(service_type)) return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    const db = await getDB();
    const provider = await db.collection('users').findOne({ id: decoded.userId, role: 'PROVIDER' });
    if (!provider || provider.provider_status === 'OFFLINE' || provider.available === false) {
      return NextResponse.json({ error: 'Set your provider status to ONLINE before accepting requests.' }, { status: 409 });
    }
    const capabilities = provider.provider_types?.length ? provider.provider_types : [provider.provider_type];
    if (!capabilities.includes(service_type)) {
      return NextResponse.json({ error: `Your account is not approved for ${service_type.toLowerCase()} requests.` }, { status: 403 });
    }
    const otp = String(crypto.randomInt(100000, 1000000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const now = new Date().toISOString();
    const result = await db.collection('bookings').findOneAndUpdate(
      { id: bookingId, status: { $nin: ['CANCELLED', 'COMPLETED'] }, services: { $elemMatch: { type: service_type, status: { $in: ['REQUESTED', 'SEARCHING', 'REJECTED'] }, provider_id: null, declined_provider_ids: { $ne: decoded.userId } } } },
      { $set: { 'services.$.provider_id': decoded.userId, 'services.$.provider_name': provider.name, 'services.$.provider_phone': provider.phone || null, 'services.$.provider_rating': provider.rating ?? provider.average_rating ?? null, 'services.$.status': 'ACCEPTED', 'services.$.accepted_at': now, status: 'ACCEPTED', otp_hash: otpHash, otp_code: otp, otp_used: false, updated_at: now } },
      { returnDocument: 'after' }
    );
    const booking = result?.value || result;
    if (!booking) return NextResponse.json({ error: 'This offer was already accepted, cancelled, declined by you, or is no longer available.' }, { status: 409 });
    await db.collection('users').updateOne({ id: decoded.userId }, { $set: { available: false } });
    emitBooking(booking, 'booking:accepted');
    const competingProviders = await db.collection('users').find({
      role: 'PROVIDER',
      station: { $regex: new RegExp(`^${booking.station}$`, 'i') },
      provider_status: 'ONLINE',
      available: true,
      $or: [{ provider_types: service_type }, { provider_type: service_type }],
    }, { projection: { id: 1 } }).toArray();
    for (const competingProvider of competingProviders) {
      if (competingProvider.id !== decoded.userId) {
        emitRealtime('booking:removed', { booking_id: bookingId }, [`provider:${competingProvider.id}`]);
      }
    }
    await notifyUsers(
      [booking.user_id, decoded.userId],
      'Provider accepted',
      `${provider.name} accepted your ${service_type.toLowerCase()} request.`,
      { booking_id: bookingId, service_type, provider_id: decoded.userId }
    );
    return NextResponse.json({ message: 'Booking accepted', booking: { ...booking, otp_hash: undefined, otp_code: undefined } });
  } catch (err) {
    console.error('Accept booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
