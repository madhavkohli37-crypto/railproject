import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  try {
    const db = await getDB();
    const logs = await db.collection('audit_logs')
      .find({ actor_id: decoded.userId })
      .sort({ timestamp: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Activity list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
