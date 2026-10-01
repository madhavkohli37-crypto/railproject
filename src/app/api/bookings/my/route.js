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
    const bookings = await db.collection('bookings')
      .find({ user_id: decoded.userId })
      .sort({ created_at: -1 })
      .toArray();
    const enriched = await Promise.all(bookings.map(async booking => {
      const services = await Promise.all(booking.services.map(async service => {
        if (!service.provider_id || (service.provider_phone && service.provider_profile_picture !== undefined)) return service;
        const provider = await db.collection('users').findOne(
          { id: service.provider_id, role: 'PROVIDER' },
          { projection: { _id: 0, name: 1, phone: 1, email: 1, profile_picture: 1, rating: 1, average_rating: 1 } }
        );
        return provider ? {
          ...service,
          provider_name: service.provider_name || provider.name,
          provider_phone: provider.phone || null,
          provider_email: provider.email || null,
          provider_profile_picture: service.provider_profile_picture || provider.profile_picture || null,
          provider_rating: service.provider_rating ?? provider.rating ?? provider.average_rating ?? null,
        } : service;
      }));
      return { ...booking, services };
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
