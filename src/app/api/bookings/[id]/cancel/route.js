import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  }

  const { id } = await params;
  const bookingId = parseInt(id);

  try {
    const db = await getDB();
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
        { $set: { available: true } }
      );
    }

    const now = new Date().toISOString();
    await db.collection('bookings').updateOne(
      { id: bookingId },
      { $set: { status: 'CANCELLED', updated_at: now } }
    );

    await db.collection('audit_logs').insertOne({
      action: 'BOOKING_CANCELLED',
      actor_id: decoded.userId,
      booking_id: bookingId,
      timestamp: now,
      details: 'Passenger cancelled the booking'
    });

    return NextResponse.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
