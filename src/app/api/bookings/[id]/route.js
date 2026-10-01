import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const TERMINAL = new Set(['CANCELLED', 'COMPLETED', 'REJECTED_OR_CANCELLED']);

export async function GET(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const bookingId = String((await params).id);
  try {
    const db = await getDB();
    const booking = await db.collection('bookings').findOne({
      $or: [{ id: bookingId }, { id: Number(bookingId) }]
    });
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    const assignedService = (booking.services || []).find(service => service.provider_id === decoded.userId);
    if (booking.user_id !== decoded.userId && !assignedService) {
      return NextResponse.json({ error: 'Access denied to this booking' }, { status: 403 });
    }
    const passenger = await db.collection('users').findOne(
      { id: booking.user_id },
      { projection: { _id: 0, name: 1, phone: 1, email: 1, profile_picture: 1 } }
    );
    const services = await Promise.all((booking.services || []).map(async service => {
      if (!service.provider_id) return service;
      const provider = await db.collection('users').findOne(
        { id: service.provider_id, role: 'PROVIDER' },
        { projection: { _id: 0, name: 1, phone: 1, email: 1, profile_picture: 1, rating: 1, average_rating: 1 } }
      );
      return provider ? {
        ...service,
        provider_name: service.provider_name || provider.name,
        provider_phone: service.provider_phone || provider.phone || null,
        provider_email: service.provider_email || provider.email || null,
        provider_profile_picture: service.provider_profile_picture || provider.profile_picture || null,
        provider_rating: service.provider_rating ?? provider.rating ?? provider.average_rating ?? null,
      } : service;
    }));
    const { otp_hash, ...safeBooking } = { ...booking, services, passenger };
    if (decoded.role === 'PROVIDER') delete safeBooking.otp_code;
    return NextResponse.json({
      ...safeBooking,
      active: !TERMINAL.has(booking.status),
    });
  } catch (err) {
    console.error('Booking detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
