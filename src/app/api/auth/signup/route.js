import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, nextId } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const db = await getDB();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'This email is already registered. Please login.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await nextId('users');

    const user = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      phone: phone || null,
      role: 'PASSENGER',
      created_at: new Date().toISOString(),
    };

    await db.collection('users').insertOne(user);
    const token = signToken({ userId: user.id, name: user.name, email: user.email, role: user.role });

    return NextResponse.json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    }, { status: 201 });
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
