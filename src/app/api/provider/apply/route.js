import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDB, nextId } from '@/lib/db';

// POST /api/provider/apply — Public, no auth required
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name, email, password, phone,
      provider_type, station,
      experience_years, aadhar_number, aadhar_image
    } = body;

    if (!name || !email || !password || !phone || !provider_type || !station) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const db = await getDB();
    const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await nextId('users');

    const application = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      phone: phone.trim(),
      role: 'PROVIDER',
      status: 'PENDING',          // Must be approved by admin before login
      provider_type,
      station,
      experience_years: experience_years ? parseInt(experience_years) : 0,
      aadhar_number: aadhar_number ? aadhar_number.trim() : null,
      aadhar_image: aadhar_image || null,
      verification_status: 'PENDING',
      available: false,           // Not available until approved

      rating: 5.0,
      completed_jobs: 0,
      earnings: 0,
      price_per_bag: provider_type === 'PORTER' ? 60 : undefined,
      base_rate: provider_type === 'WHEELCHAIR' ? 150 : provider_type === 'MEET_AND_GREET' ? 250 : undefined,
      applied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    await db.collection('users').insertOne(application);

    // Audit log
    await db.collection('audit_logs').insertOne({
      action: 'PROVIDER_APPLICATION_SUBMITTED',
      actor_id: userId,
      booking_id: null,
      timestamp: new Date().toISOString(),
      details: `New provider application from ${name} (${email}) for ${provider_type} at ${station}`,
    });

    return NextResponse.json({
      message: 'Application submitted successfully! An admin will review and approve your account shortly.',
      applicationId: userId,
    }, { status: 201 });
  } catch (err) {
    console.error('Provider apply error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
