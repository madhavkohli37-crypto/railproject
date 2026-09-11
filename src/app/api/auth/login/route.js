import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB } from '@/lib/db';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = await getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Block PENDING / REJECTED provider applications
    if (user.role === 'PROVIDER' && user.status === 'PENDING') {
      return NextResponse.json({
        error: 'Your application is under review. You will be notified once an admin approves your account.',
        code: 'PENDING_APPROVAL',
      }, { status: 403 });
    }
    if (user.role === 'PROVIDER' && user.status === 'REJECTED') {
      return NextResponse.json({
        error: 'Your application was rejected. Please contact the admin for more information.',
        code: 'APPLICATION_REJECTED',
      }, { status: 403 });
    }

    const token = signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'PASSENGER',
    });

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role || 'PASSENGER',
        good_human_score: user.good_human_score ?? 100,
        priority_eligible: (user.good_human_score ?? 100) >= 70,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
