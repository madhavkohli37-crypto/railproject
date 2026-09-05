import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH /api/admin/settings — Update admin's own email and/or password
export async function PATCH(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { newEmail, newPassword, currentPassword } = body;

    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required to make changes' }, { status: 400 });
    }

    const db = await getDB();
    const admin = await db.collection('users').findOne({ id: decoded.userId, role: 'ADMIN' });
    if (!admin) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Verify current password
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const updates = { updated_at: new Date().toISOString() };

    if (newEmail && newEmail !== admin.email) {
      const emailTaken = await db.collection('users').findOne({ email: newEmail.toLowerCase().trim() });
      if (emailTaken) {
        return NextResponse.json({ error: 'That email is already in use' }, { status: 409 });
      }
      updates.email = newEmail.toLowerCase().trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
      }
      updates.password_hash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { id: decoded.userId },
      { $set: updates }
    );

    // Audit
    await db.collection('audit_logs').insertOne({
      action: 'ADMIN_SETTINGS_UPDATED',
      actor_id: decoded.userId,
      booking_id: null,
      timestamp: updates.updated_at,
      details: `Admin updated their ${newEmail ? 'email' : ''}${newEmail && newPassword ? ' and ' : ''}${newPassword ? 'password' : ''}`
    });

    return NextResponse.json({ message: 'Admin credentials updated successfully' });
  } catch (err) {
    console.error('Admin settings error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
