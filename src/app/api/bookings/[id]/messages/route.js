import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { emitRealtime } from '@/lib/realtime';

async function getParticipant(db, bookingId, userId) {
  const normalizedId = String(bookingId);
  const numericId = Number(normalizedId);
  const booking = await db.collection('bookings').findOne(Number.isNaN(numericId)
    ? { id: normalizedId }
    : { $or: [{ id: normalizedId }, { id: numericId }] });
  if (!booking) return null;
  const isPassenger = String(booking.user_id) === String(userId);
  const service = (booking.services || []).find(item => String(item.provider_id) === String(userId));
  if (!isPassenger && !service) return null;
  return { booking, role: isPassenger ? 'PASSENGER' : 'SERVICE_PROVIDER' };
}

export async function GET(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { id } = await params;
    const db = await getDB();
    const participant = await getParticipant(db, id, decoded.userId);
    if (!participant) return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    const messages = await db.collection('booking_messages')
      .find({ booking_id: String(id) }, { projection: { _id: 0 } })
      .sort({ created_at: 1 })
      .limit(100)
      .toArray();
    return NextResponse.json(messages);
  } catch (err) {
    console.error('Booking messages fetch error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDB();
    const participant = await getParticipant(db, id, decoded.userId);
    if (!participant) return NextResponse.json({ error: 'Booking not found or access denied' }, { status: 404 });
    const rooms = participant.role === 'PASSENGER'
      ? (participant.booking.services || []).flatMap(service => service.provider_id ? [`provider:${service.provider_id}`, `user:${service.provider_id}`] : [])
      : [`user:${participant.booking.user_id}`];

    if (typeof body.typing === 'boolean') {
      if (['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(participant.booking.status)) {
        return NextResponse.json({ error: 'Chat is unavailable for this booking' }, { status: 409 });
      }
      emitRealtime('booking:typing', {
        booking_id: String(id),
        sender_id: decoded.userId,
        sender_name: decoded.name || 'Participant',
        typing: body.typing,
      }, [...new Set(rooms)]);
      return NextResponse.json({ delivered: true });
    }

    const text = typeof body.message === 'string' ? body.message.trim() : '';
    if (!text || text.length > 500) {
      return NextResponse.json({ error: 'Message must contain 1 to 500 characters' }, { status: 400 });
    }
    if (['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED'].includes(participant.booking.status)) {
      return NextResponse.json({ error: 'Chat is unavailable for this booking' }, { status: 409 });
    }

    const message = {
      id: `${Date.now()}-${decoded.userId}-${Math.random().toString(36).slice(2, 8)}`,
      booking_id: String(id),
      sender_id: decoded.userId,
      sender_role: participant.role,
      sender_name: decoded.name || 'Participant',
      message: text,
      created_at: new Date().toISOString(),
    };
    await db.collection('booking_messages').insertOne(message);
    const messageRooms = [
      `booking:${participant.booking.id}`,
      `user:${participant.booking.user_id}`,
      ...(participant.booking.services || []).flatMap(service => service.provider_id ? [`provider:${service.provider_id}`, `user:${service.provider_id}`] : []),
    ];
    emitRealtime('booking:message', { message }, [...new Set(messageRooms)]);
    return NextResponse.json(message, { status: 201 });
  } catch (err) {
    console.error('Booking message send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
