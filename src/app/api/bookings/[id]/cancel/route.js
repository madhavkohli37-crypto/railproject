import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitBooking, emitRealtime, notifyUsers } from '@/lib/realtime';
import { parseCancellation } from '@/lib/bookingLifecycle';

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  }

  const { id } = await params;
  const bookingId = parseInt(id);

  try {
    const db = await getDB();
    const body = await req.json().catch(() => ({}));
    const cancellation = parseCancellation(body);
    if (cancellation.error) return NextResponse.json({ error: cancellation.error }, { status: 400 });
    const booking = await db.collection('bookings').findOne({ id: bookingId, user_id: decoded.userId });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Booking cannot be cancelled' }, { status: 409 });
    }

    const providerIds = booking.services.filter(s => s.provider_id).map(s => s.provider_id);
    if (providerIds.length > 0) {
      await db.collection('users').updateMany(
        { id: { $in: providerIds } },
        { $set: { available: true, provider_status: 'ONLINE' } }
      );
    }

    const now = new Date().toISOString();
    const updatedResult = await db.collection('bookings').findOneAndUpdate(
      { id: bookingId, status: { $nin: ['CANCELLED', 'COMPLETED'] } },
      {
        $set: {
          status: 'CANCELLED',
          cancelled_by: 'PASSENGER',
          cancellation_reason: cancellation.reasonCode,
          cancellation_description: cancellation.description,
          cancelled_at: now,
          cancellation_service_types: booking.services.map(service => service.type),
          updated_at: now,
          otp_used: true,
        },
        $unset: { otp_hash: '', otp_code: '' },
      },
      { returnDocument: 'after' }
    );
    const updated = updatedResult?.value || updatedResult;
    if (!updated) {
      return NextResponse.json({ error: 'Booking was already changed. Refresh and try again.' }, { status: 409 });
    }
    emitBooking(updated);
    emitRealtime('booking:cancelled', { booking: updated }, [`booking:${bookingId}`, `user:${decoded.userId}`, ...providerIds.map(id => `provider:${id}`)]);
    const serviceTypes = [...new Set(booking.services.map(service => service.type).filter(Boolean))];
    const eligibleProviders = await db.collection('users').find({
      role: 'PROVIDER',
      station: { $regex: new RegExp(`^${booking.station}$`, 'i') },
      $or: [
        { provider_types: { $in: serviceTypes } },
        { provider_type: { $in: serviceTypes } },
      ],
    }, { projection: { id: 1 } }).toArray();
    for (const provider of eligibleProviders) {
      emitRealtime('booking:removed', { booking_id: bookingId, reason: 'PASSENGER_CANCELLED' }, [`provider:${provider.id}`]);
    }
    await notifyUsers(
      [decoded.userId, ...eligibleProviders.map(provider => provider.id)],
      'Booking cancelled',
      `Booking #${bookingId} was cancelled by the passenger: ${cancellation.description}`,
      { booking_id: bookingId, reason: cancellation.reasonCode, description: cancellation.description, status: 'CANCELLED' }
    );

    await db.collection('audit_logs').insertOne({
      action: 'BOOKING_CANCELLED',
      actor_id: decoded.userId,
      booking_id: bookingId,
      timestamp: now,
      details: `${cancellation.reasonCode}: ${cancellation.description}`
    });

    return NextResponse.json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
