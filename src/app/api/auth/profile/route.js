import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, DEFAULT_GOOD_HUMAN_SCORE } from '@/lib/db';
import { verifyToken, signToken } from '@/lib/auth';

export async function PATCH(req) {
  const decoded = verifyToken(req);
  if (!decoded) return NextResponse.json({ error: 'Access token missing or invalid' }, { status: 401 });
  try {
    const { name, phone, email, currentPassword, newPassword } = await req.json();
    if (!name?.trim() || !phone?.trim()) return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 });
    if (newPassword && (!currentPassword || newPassword.length < 6)) {
      return NextResponse.json({ error: 'Current password is required and the new password must be at least 6 characters' }, { status: 400 });
    }
    const db = await getDB();
    const account = await db.collection('users').findOne({ id: decoded.userId });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    if (newPassword && !(await bcrypt.compare(currentPassword, account.password_hash))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }
    const normalizedEmail = email?.trim().toLowerCase() || null;
    const duplicate = await db.collection('users').findOne({
      $and: [
        { id: { $ne: decoded.userId } },
        { $or: [{ phone: phone.trim() }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])] },
      ],
    });
    if (duplicate) return NextResponse.json({ error: 'That phone number or email is already in use' }, { status: 409 });
    const updates = { name: name.trim(), phone: phone.trim(), email: normalizedEmail, updated_at: new Date().toISOString() };
    if (newPassword) updates.password_hash = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne({ id: decoded.userId }, { $set: updates });
    const user = { id: account.id, user_id: `U-${account.id}`, name: updates.name, email: updates.email, phone: updates.phone, role: account.role, good_human_score: account.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE, reward_coins: account.reward_coins ?? 0, provider_status: account.provider_status || null, available: account.available !== false, provider_type: account.provider_type || null, provider_types: account.provider_types || [] };
    const token = signToken({ userId: user.id, name: user.name, email: user.email, role: user.role });
    return NextResponse.json({ message: 'Profile updated successfully', user, token });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
