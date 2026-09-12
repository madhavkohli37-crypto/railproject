import { NextResponse } from 'next/server';
import { getDB, nextId, DEFAULT_GOOD_HUMAN_SCORE } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { station, train_number, platform, services, scheduled_at, priority_requested = false } = body;

    if (!station || !services || !services.length) {
      return NextResponse.json({ error: 'Station and services are required' }, { status: 400 });
    }

    const db = await getDB();
    const passenger = await db.collection('users').findOne({ id: decoded.userId });
    const goodHumanScore = passenger?.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE;
    const priority_approved = Boolean(priority_requested) && goodHumanScore >= 700;
    const bookingId = await nextId('bookings');

    let total_price = 0;
    const requestedServices = services.map(srv => {
      let price = 0;
      if (srv.type === 'PORTER') price = (srv.bags_count || 1) * 60;
      else if (srv.type === 'WHEELCHAIR') price = 150;
      else if (srv.type === 'MEET_AND_GREET') price = 250;
      total_price += price;

      return {
        ...srv,
        price,
        status: 'REQUESTED',
        provider_id: null,
        provider_name: null,
      };
    });

    const booking = {
      id: bookingId,
      user_id: decoded.userId,
      station,
      train_number: train_number || null,
      platform: platform || null,
      scheduled_at: scheduled_at || null,
      services: requestedServices,
      status: 'REQUESTED',
      total_price,
      priority_requested: Boolean(priority_requested),
      priority_approved,
      good_human_score_at_booking: goodHumanScore,
      created_at: new Date().toISOString(),
    };

    // Auto-assignment logic
    for (let i = 0; i < booking.services.length; i++) {
      const srv = booking.services[i];
      const provider = await db.collection('users').findOne({
        role: 'PROVIDER',
        provider_type: srv.type,
        station: { $regex: new RegExp(`^${station}$`, 'i') },
        available: true
      });

      if (provider) {
        srv.provider_id = provider.id;
        srv.provider_name = provider.name;
        srv.provider_phone = provider.phone;
        srv.status = 'ASSIGNED';

        await db.collection('users').updateOne(
          { id: provider.id },
          { $set: { available: false } }
        );
      }
    }

    const allAssigned = booking.services.every(s => s.status === 'ASSIGNED');
    const someAssigned = booking.services.some(s => s.status === 'ASSIGNED');
    if (allAssigned) booking.status = 'ASSIGNED';
    else if (someAssigned) booking.status = 'PARTIALLY_ASSIGNED';

    await db.collection('bookings').insertOne(booking);

    await db.collection('audit_logs').insertOne({
      action: 'BOOKING_CREATED',
      actor_id: decoded.userId,
      booking_id: bookingId,
      timestamp: booking.created_at,
      details: `Passenger requested ${services.length} services at ${station}`
    });

    return NextResponse.json({ message: 'Booking requested!', booking }, { status: 201 });
  } catch (err) {
    console.error('Booking error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
