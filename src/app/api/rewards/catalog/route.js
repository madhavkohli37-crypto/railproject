import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const user = verifyToken(req);
  if (!user || user.role !== 'PASSENGER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const db = await getDB();
  const [coupons, plans, config] = await Promise.all([
    db.collection('reward_catalog').find({ active: true }).project({ _id: 0 }).toArray(),
    db.collection('reward_plans').find({ active: true, id: { $ne: 'safe-traveller' } }).project({ _id: 0 }).toArray(),
    db.collection('reward_config').findOne({ _id: 'defaults' }, { projection: { _id: 0 } })
  ]);
  return NextResponse.json({ coupons, plans, config });
}
