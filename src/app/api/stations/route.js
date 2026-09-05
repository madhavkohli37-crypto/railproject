import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDB();
    const providers = await db.collection('users').find({ role: 'PROVIDER' }).toArray();
    const stations = [...new Set(providers.map(c => c.station))].filter(Boolean).sort();
    if (stations.length === 0) {
      stations.push('New Delhi', 'Mumbai CST', 'Bengaluru City');
    }
    return NextResponse.json(stations);
  } catch (err) {
    console.error('Error fetching stations:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
