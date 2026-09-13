import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { getScoreBand, SAFE_SCORE_THRESHOLD } from '@/lib/rewards';

export async function GET(req) {
  const user = verifyToken(req);
  if (!user || user.role !== 'PASSENGER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const db = await getDB();
  const passenger = await db.collection('users').findOne({ id: user.userId }, { projection: { good_human_score: 1, reward_coins: 1, reward_plan: 1 } });
  if (!passenger) return NextResponse.json({ error: 'Passenger not found' }, { status: 404 });
  const score = passenger.good_human_score ?? 400;
  return NextResponse.json({ score, coins: passenger.reward_coins || 0, band: getScoreBand(score), safe_threshold: SAFE_SCORE_THRESHOLD, plan: passenger.reward_plan || null });
}
