import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  try {
    const db = await getDB();
    const notifications = await db.collection('notifications').find({ user_id: decoded.userId }).sort({ created_at: -1 }).limit(50).toArray();
    return NextResponse.json(notifications);
  } catch (err) {
    console.error('Notification list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
