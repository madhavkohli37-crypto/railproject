import { getDB } from '@/lib/db';

export function emitRealtime(event, payload, rooms = []) {
  const io = global._railassistSocketIO;
  if (io) {
    for (const room of rooms) {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[realtime] emitting ${event} -> ${room}`);
      }
      io.to(room).emit(event, payload);
    }
    return;
  }

  const relayUrl = process.env.REALTIME_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL;
  const relaySecret = process.env.REALTIME_INTERNAL_SECRET;
  if (!relayUrl || !relaySecret) {
    console.warn(`[realtime] Socket.IO unavailable for ${event}; realtime relay is not configured`);
    return;
  }
  const endpoint = `${relayUrl.replace(/\/$/, '')}/api/realtime/publish`;
  void fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${relaySecret}`,
    },
    body: JSON.stringify({ event, payload, rooms }),
  }).catch(error => console.error(`[realtime] relay failed for ${event}:`, error.message));
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
  if (!booking) return;
  // Contact details are deliberately audience-scoped. A booking room is only
  // joined after the server has authorized the party.
  const providerRooms = (booking.services || []).flatMap(s => s.provider_id ? [`provider:${s.provider_id}`, `user:${s.provider_id}`] : []);
  const providerBooking = {
    ...safeBooking,
    services: (booking.services || []).map(service => {
      const { provider_phone, ...withoutProviderPhone } = service;
      return withoutProviderPhone;
    }),
  };
  const userRoom = `user:${booking.user_id}`;
  const otherRooms = [`booking:${booking.id}`, ...providerRooms];
  emitRealtime(event, { booking: providerBooking }, providerRooms);
  emitRealtime(event, { booking: safeBooking }, [`booking:${booking.id}`]);
  emitRealtime(event, { booking: { ...safeBooking, ...(otp_code ? { otp_code } : {}) } }, [userRoom]);
  const aliases = {
    'booking:created': 'booking:new',
    'booking:updated': null,
  };
  if (aliases[event]) {
    emitRealtime(aliases[event], { booking: providerBooking }, providerRooms);
    emitRealtime(aliases[event], { booking: safeBooking }, [`booking:${booking.id}`]);
    emitRealtime(aliases[event], { booking: { ...safeBooking, ...(otp_code ? { otp_code } : {}) } }, [userRoom]);
  }
}
