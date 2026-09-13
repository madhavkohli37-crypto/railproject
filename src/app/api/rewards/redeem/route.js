import { NextResponse } from 'next/server';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  const user = verifyToken(req);
  if (!user || user.role !== 'PASSENGER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  try {
    const { item_id, type = 'COUPON', idempotency_key } = await req.json();
    if (!item_id || !idempotency_key || typeof idempotency_key !== 'string' || idempotency_key.length > 100) return NextResponse.json({ error: 'item_id and idempotency_key are required' }, { status: 400 });
    const db = await getDB();
    const prior = await db.collection('reward_transactions').findOne({ user_id: user.userId, idempotency_key });
    if (prior) return NextResponse.json({ redemption: prior, duplicate: true });
    if (!['COUPON', 'PLAN'].includes(type)) return NextResponse.json({ error: 'Invalid reward type' }, { status: 400 });
    const collection = type === 'PLAN' ? 'reward_plans' : 'reward_catalog';
    const item = await db.collection(collection).findOne({ id: item_id, active: true });
    if (!item) return NextResponse.json({ error: 'Reward not found or inactive' }, { status: 404 });
    const passenger = await db.collection('users').findOne({ id: user.userId }, { projection: { good_human_score: 1 } });
    if (type === 'PLAN' && (passenger?.good_human_score || 0) < (item.minimum_score || 0)) return NextResponse.json({ error: 'Good Human Score is below the plan requirement' }, { status: 403 });
    const cost = Number(item.cost_coins || 0);
    const redemption = { id: await nextId('rewardTransactions', db), user_id: user.userId, item_id, type, title: item.title, cost_coins: cost, coupon_code: item.coupon_code || null, duration_days: item.duration_days || null, created_at: new Date().toISOString() };
    try { await db.collection('reward_transactions').insertOne({ ...redemption, status: 'PENDING' }); } catch (error) {
      if (error?.code === 11000) return NextResponse.json({ redemption: await db.collection('reward_transactions').findOne({ user_id: user.userId, idempotency_key }), duplicate: true });
      throw error;
    }
    const updated = await db.collection('users').findOneAndUpdate({ id: user.userId, reward_coins: { $gte: cost } }, { $inc: { reward_coins: -cost }, ...(type === 'PLAN' ? { $set: { reward_plan: item.id } } : {}) }, { returnDocument: 'after', projection: { reward_coins: 1 } });
    if (!updated) {
      await db.collection('reward_transactions').deleteOne({ user_id: user.userId, idempotency_key, status: 'PENDING' });
      return NextResponse.json({ error: 'Insufficient RailCoins' }, { status: 409 });
    }
    await db.collection('reward_transactions').updateOne({ user_id: user.userId, idempotency_key }, { $set: { status: 'COMPLETED' } });
    redemption.status = 'COMPLETED';
    return NextResponse.json({ redemption, remaining_coins: updated.reward_coins });
  } catch (error) {
    console.error('Reward redemption error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
