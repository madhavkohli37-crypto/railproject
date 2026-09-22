import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  try {
    const db = await getDB();
    const provider = await db.collection('users').findOne({ id: decoded.userId });
    const types = provider?.provider_types?.length ? provider.provider_types : [provider?.provider_type || 'PORTER'];
    const bookings = await db.collection('bookings').find({
      status: { $nin: ['CANCELLED', 'COMPLETED'] }, station: provider.station,
      services: { $elemMatch: { type: { $in: types }, status: { $in: ['REQUESTED', 'SEARCHING'] }, provider_id: null } }
    }).sort({ priority_approved: -1, created_at: 1 }).toArray();
    const jobs = bookings.map(booking => ({
      ...booking,
      services: booking.services.filter(service =>
        types.includes(service.type)
        && ['REQUESTED', 'SEARCHING'].includes(service.status)
        && !service.provider_id
        && !(service.declined_provider_ids || []).includes(decoded.userId)
      ),
    })).filter(booking => booking.services.length > 0);
    return NextResponse.json(jobs);
  } catch (err) {
    console.error('Provider offers error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
