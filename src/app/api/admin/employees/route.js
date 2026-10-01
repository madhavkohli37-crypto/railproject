import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { name, email, phone, password, provider_type, station } = await req.json();
    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    const db = await getDB();
    const normalizedEmail = email?.toLowerCase().trim() || null;
    const existing = await db.collection('users').findOne({
      $or: [{ phone: phone.trim() }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])],
    });
    if (existing) {
      return NextResponse.json({ error: 'Phone number or email already in use' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await nextId('users');

    const newEmployee = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password_hash,
      role: 'PROVIDER',
      provider_type: provider_type || 'PORTER',
      provider_types: [provider_type || 'PORTER'],
      station: station || 'New Delhi',
      available: true,
      provider_status: 'ONLINE',
      rating: 5.0,
      completed_jobs: 0,
      earnings: 0,
      price_per_bag: provider_type === 'PORTER' ? 60 : undefined,
      base_rate: provider_type === 'WHEELCHAIR' ? 150 : (provider_type === 'MEET_AND_GREET' ? 250 : undefined),
      created_at: new Date().toISOString(),
    };

    await db.collection('users').insertOne(newEmployee);
    return NextResponse.json({ message: 'Employee created' }, { status: 201 });
  } catch (err) {
    console.error('Create employee error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
