import { NextResponse } from 'next/server';
import { getDB, nextId } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PASSENGER') {
    return NextResponse.json({ error: 'Only passengers can appeal a complaint' }, { status: 403 });
  }

  try {
    const complaintId = parseInt((await params).id, 10);
    const { reason } = await req.json();
    if (!reason?.trim() || reason.trim().length < 10) {
      return NextResponse.json({ error: 'Please explain the objection in at least 10 characters' }, { status: 400 });
    }

    const db = await getDB();
    const complaint = await db.collection('complaints').findOne({
      id: complaintId,
      'resolution.accused_user_id': decoded.userId,
      status: 'UPHELD',
    });
    if (!complaint) {
      return NextResponse.json({ error: 'Only upheld complaints against your account can be appealed' }, { status: 404 });
    }
    if (complaint.appeal?.status === 'PENDING') {
      return NextResponse.json({ error: 'An appeal is already awaiting review' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const appeal = {
      id: await nextId('complaintAppeals', db),
      appellant_id: decoded.userId,
      reason: reason.trim(),
      status: 'PENDING',
      created_at: now,
      updated_at: now,
    };
    await db.collection('complaints').updateOne(
      { id: complaintId },
      { $set: { appeal, updated_at: now } },
    );
    await db.collection('notifications').insertOne({
      id: await nextId('notifications', db),
      user_id: decoded.userId,
      title: 'Appeal submitted',
      message: `Your appeal for complaint #${complaintId} was submitted for re-review.`,
      complaint_id: complaintId,
      impact: { score_change: 0 },
      read: false,
      created_at: now,
    });
    return NextResponse.json({ message: 'Appeal submitted for re-review', appeal }, { status: 201 });
  } catch (err) {
    console.error('Complaint appeal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
