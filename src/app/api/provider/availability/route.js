import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitRealtime } from '@/lib/realtime';

export async function PATCH(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { available, provider_types } = await req.json();
    const db = await getDB();
    const types = Array.isArray(provider_types) ? provider_types.filter(t => ['PORTER', 'WHEELCHAIR', 'MEET_AND_GREET'].includes(t)) : undefined;
    const update = { $set: { available: !!available, provider_status: available ? 'ONLINE' : 'OFFLINE', updated_at: new Date().toISOString() } };
    if (types) update.$set.provider_types = types;
    await db.collection('users').updateOne(
      { id: decoded.userId },
      update
    );
    emitRealtime('provider:availability', { provider_id: decoded.userId, status: available ? 'ONLINE' : 'OFFLINE', provider_types: types }, [`provider:${decoded.userId}`]);
    return NextResponse.json({ message: 'Availability updated', available: !!available });
  } catch (err) {
    console.error('Update availability error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
