import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { available } = await req.json();
    const db = await getDB();
    await db.collection('users').updateOne(
      { id: decoded.userId },
      { $set: { available: !!available } }
    );
    return NextResponse.json({ message: 'Availability updated', available: !!available });
  } catch (err) {
    console.error('Update availability error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
