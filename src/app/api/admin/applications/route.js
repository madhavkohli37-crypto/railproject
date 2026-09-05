import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// GET /api/admin/applications — List all pending provider applications
export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const db = await getDB();
    const applications = await db.collection('users')
      .find({ role: 'PROVIDER', status: { $in: ['PENDING', 'REJECTED'] } })
      .sort({ applied_at: -1 })
      .toArray();

    // Strip password hash before sending
    const safe = applications.map(({ password_hash, ...rest }) => rest);
    return NextResponse.json(safe);
  } catch (err) {
    console.error('Applications fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
