import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const db = await getDB();
    const bookings = await db.collection('bookings').find({
      'services.provider_id': decoded.userId
    }).sort({ created_at: -1 }).toArray();

    const jobs = bookings.map(b => {
      const myService = b.services.find(s => s.provider_id === decoded.userId);
      return {
        booking_id: b.id,
        station: b.station,
        train_number: b.train_number,
        platform: b.platform,
        scheduled_at: b.scheduled_at,
        created_at: b.created_at,
        overall_status: b.status,
        passenger_id: b.user_id,
        ...myService
      };
    });

    return NextResponse.json(jobs);
  } catch (err) {
    console.error('Provider dashboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
