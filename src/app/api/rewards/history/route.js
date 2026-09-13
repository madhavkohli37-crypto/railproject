import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const user = verifyToken(req);
  if (!user || user.role !== 'PASSENGER') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  const db = await getDB();
  const history = await db.collection('reward_transactions').find({ user_id: user.userId }).sort({ created_at: -1 }).limit(100).project({ _id: 0 }).toArray();
  const scoreHistory = await db.collection('score_transactions').find({ user_id: user.userId }).sort({ created_at: -1 }).limit(100).project({ _id: 0 }).toArray();
  return NextResponse.json({ redemptions: history, score_transactions: scoreHistory });
}
