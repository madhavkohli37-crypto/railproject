import { getDB } from '@/lib/db';

export function emitRealtime(event, payload, rooms = []) {
  const io = global._railassistSocketIO;
  if (!io) return;
  for (const room of rooms) io.to(room).emit(event, payload);
}

export async function notifyUsers(userIds, title, message, data = {}) {
  const db = await getDB();
  const now = new Date().toISOString();
  const ids = [...new Set(userIds.filter(Boolean))];
  if (ids.length) {
    await db.collection('notifications').insertMany(ids.map(user_id => ({
      id: `${Date.now()}-${user_id}-${Math.random().toString(36).slice(2, 8)}`,
      user_id, title, message, data, read: false, created_at: now
    })));
    for (const userId of ids) {
      emitRealtime('notification:new', {
        id: `${Date.now()}-${userId}`,
        user_id: userId,
        title,
        message,
        data,
        read: false,
        created_at: now,
      }, [`user:${userId}`]);
    }
  }
}

export function emitBooking(booking, event = 'booking:updated') {
  const { otp_hash, otp_code, ...safeBooking } = booking || {};
  const rooms = [`booking:${booking.id}`, `user:${booking.user_id}`, ...(booking.services || []).flatMap(s => s.provider_id ? [`provider:${s.provider_id}`, `user:${s.provider_id}`] : [])];
  emitRealtime(event, { booking: safeBooking }, rooms);
  const aliases = {
    'booking:created': 'booking:new',
    'booking:updated': null,
  };
  if (aliases[event]) emitRealtime(aliases[event], { booking: safeBooking }, rooms);
}
