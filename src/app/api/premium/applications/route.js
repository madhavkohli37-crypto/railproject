import { NextResponse } from 'next/server';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  const user = verifyToken(req);
  if (!user || user.role !== 'PASSENGER') {
    return NextResponse.json({ error: 'Only passengers can submit a Premium application' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { plan, name, email, phone, reason, usage } = body;
    if (!plan || !name?.trim() || !email?.trim() || !phone?.trim() || !reason?.trim()) {
      return NextResponse.json({ error: 'Plan, name, email, phone, and reason are required' }, { status: 400 });
    }
    if (reason.trim().length < 10) {
      return NextResponse.json({ error: 'Please explain why you want Premium in at least 10 characters' }, { status: 400 });
    }

    const db = await getDB();
    const now = new Date().toISOString();
    const application = {
      id: await nextId('premiumApplications', db),
      user_id: user.userId,
      plan: plan.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      reason: reason.trim(),
      usage: usage?.trim() || null,
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };
    await db.collection('premium_applications').insertOne(application);
    await db.collection('audit_logs').insertOne({
      action: 'PREMIUM_APPLICATION_SUBMITTED',
      actor_id: user.userId,
      application_id: application.id,
      timestamp: now,
      details: `Application submitted for ${application.plan}`,
    });
    return NextResponse.json({ message: 'Premium application submitted', application }, { status: 201 });
  } catch (error) {
    console.error('Premium application error:', error);
    return NextResponse.json({ error: 'Unable to submit Premium application' }, { status: 500 });
  }
}
