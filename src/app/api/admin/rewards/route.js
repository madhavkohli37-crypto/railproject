import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function admin(req) {
  const user = verifyToken(req);
  return user && user.role === 'ADMIN' ? user : null;
}

export async function GET(req) {
  if (!admin(req)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const db = await getDB();
  const [catalog, plans, config] = await Promise.all([
    db.collection('reward_catalog').find({}).project({ _id: 0 }).toArray(),
    db.collection('reward_plans').find({}).project({ _id: 0 }).toArray(),
    db.collection('reward_config').findOne({ _id: 'defaults' }, { projection: { _id: 0 } }),
  ]);
  return NextResponse.json({ catalog, plans, config });
}

export async function PATCH(req) {
  const actor = admin(req);
  if (!actor) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  try {
    const { collection = 'reward_catalog', id, updates = {} } = await req.json();
    if (!['reward_catalog', 'reward_plans'].includes(collection) || !id || typeof updates !== 'object') {
      return NextResponse.json({ error: 'collection, id, and updates are required' }, { status: 400 });
    }
    const allowed = ['title', 'description', 'cost_coins', 'money_price', 'duration_days', 'minimum_score', 'active', 'benefits'];
    const safeUpdates = Object.fromEntries(Object.entries(updates).filter(([key]) => allowed.includes(key)));
    if ('cost_coins' in safeUpdates) safeUpdates.cost_coins = Math.max(0, Number(safeUpdates.cost_coins) || 0);
    if ('minimum_score' in safeUpdates) safeUpdates.minimum_score = Math.max(0, Math.min(1000, Number(safeUpdates.minimum_score) || 0));
    if ('money_price' in safeUpdates) safeUpdates.money_price = Math.max(0, Number(safeUpdates.money_price) || 0);
    if ('duration_days' in safeUpdates) safeUpdates.duration_days = Math.max(1, Math.floor(Number(safeUpdates.duration_days) || 1));
    const db = await getDB();
    const result = await db.collection(collection).updateOne({ id }, { $set: safeUpdates });
    if (!result.matchedCount) return NextResponse.json({ error: 'Reward not found' }, { status: 404 });
    await db.collection('audit_logs').insertOne({ action: 'REWARD_CONFIG_UPDATED', actor_id: actor.userId, collection, item_id: id, updates: safeUpdates, timestamp: new Date().toISOString() });
    return NextResponse.json({ message: 'Reward configuration updated' });
  } catch (error) {
    console.error('Reward admin update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
