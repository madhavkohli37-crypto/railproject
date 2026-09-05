import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const db = await getDB();
    const bookings = await db.collection('bookings').find({}).sort({ created_at: -1 }).toArray();
    // Passengers: hide all password fields
    const allUsers = await db.collection('users').find({}).toArray();
    const audit_logs = await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).toArray();

    // Providers include password_hash so admin can audit; hide from passengers
    const providers = allUsers
      .filter(u => u.role === 'PROVIDER')
      .map(({ password, ...rest }) => rest); // keep password_hash, remove raw 'password' field if any

    const passengers = allUsers
      .filter(u => u.role === 'PASSENGER')
      .map(({ password, password_hash, ...rest }) => rest);

    return NextResponse.json({
      bookings,
      users: passengers,
      providers,
      audit_logs,
      stats: {
        total_bookings: bookings.length,
        completed_bookings: bookings.filter(b => b.status === 'COMPLETED').length,
        pending_bookings: bookings.filter(b => ['REQUESTED', 'ASSIGNED', 'PARTIALLY_ASSIGNED'].includes(b.status)).length,
        active_bookings: bookings.filter(b => b.status === 'IN_PROGRESS').length,
        total_users: passengers.length,
        total_employees: providers.length,
        active_providers: providers.filter(p => p.available).length
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
