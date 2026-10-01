import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  try {
    const db = await getDB();
    const notifications = await db.collection('notifications').find({ user_id: decoded.userId }).sort({ created_at: -1 }).limit(50).toArray();
    return NextResponse.json(notifications.map(notification => ({
      ...notification,
      category: notification.category || (notification.data?.complaint_id ? 'COMPLAINTS' : 'BOOKINGS'),
    })));
  } catch (err) {
    console.error('Notification list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  try {
    const body = await req.json();
    const db = await getDB();
    const filter = body.all
      ? { user_id: decoded.userId }
      : { user_id: decoded.userId, id: body.id };
    await db.collection('notifications').updateMany(filter, { $set: { read: true, read_at: new Date().toISOString() } });
    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
