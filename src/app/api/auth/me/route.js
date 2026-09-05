import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) {
    return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  }

  try {
    const db = await getDB();
    const user = await db.collection('users').findOne({ id: decoded.userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password_hash, ...safe } = user;
    return NextResponse.json(safe);
  } catch (err) {
    console.error('Get user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
