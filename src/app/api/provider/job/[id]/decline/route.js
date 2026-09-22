import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitBooking, notifyUsers } from '@/lib/realtime';

export async function POST(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

  const bookingId = Number((await params).id);
  try {
    const { service_type, reason } = await req.json();
    if (!['PORTER', 'WHEELCHAIR', 'MEET_AND_GREET'].includes(service_type)) {
      return NextResponse.json({ error: 'Invalid service type' }, { status: 400 });
    }

    const db = await getDB();
    const now = new Date().toISOString();
    const result = await db.collection('bookings').findOneAndUpdate(
      {
        id: bookingId,
        status: { $nin: ['CANCELLED', 'COMPLETED'] },
        services: {
          $elemMatch: {
            type: service_type,
            provider_id: null,
            status: { $in: ['REQUESTED', 'SEARCHING'] },
            declined_provider_ids: { $ne: decoded.userId },
          },
        },
      },
      {
        $addToSet: { 'services.$.declined_provider_ids': decoded.userId },
        $inc: { 'services.$.declined_count': 1 },
        $set: { updated_at: now },
      },
      { returnDocument: 'after' }
    );
    const booking = result?.value || result;
    if (!booking) return NextResponse.json({ error: 'This request is no longer available' }, { status: 409 });

    const service = booking.services.find(item => item.type === service_type);
    emitBooking(booking, 'booking:declined');
    await notifyUsers(
      [booking.user_id],
      'Provider declined your request',
      `A provider declined your ${service_type.toLowerCase()} request. We are still looking for another provider.`,
      {
        booking_id: bookingId,
        service_type,
        declined_count: service?.declined_count || 1,
        reason: reason?.trim() || null,
      }
    );

    return NextResponse.json({
      message: 'Request declined. It remains available to other providers.',
      declined_count: service?.declined_count || 1,
    });
  } catch (err) {
    console.error('Decline booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
