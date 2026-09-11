import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const ACTIONS = ['UPHOLD', 'DISMISS', 'REQUEST_INFO'];

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || !['MANAGER', 'ADMIN'].includes(decoded.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const complaintId = parseInt((await params).id, 10);
    const { action, accused_user_id, fine_amount = 0, score_penalty = 0, notes } = await req.json();
    if (!ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid complaint action' }, { status: 400 });
    }
    if (!Number.isInteger(score_penalty) || score_penalty < 0 || score_penalty > 100 || Number(fine_amount) < 0) {
      return NextResponse.json({ error: 'Invalid fine or score penalty' }, { status: 400 });
    }
    if (action === 'UPHOLD' && !Number.isInteger(Number(accused_user_id))) {
      return NextResponse.json({ error: 'An accused passenger is required to uphold a complaint' }, { status: 400 });
    }

    const db = await getDB();
    const complaint = await db.collection('complaints').findOne({ id: complaintId });
    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    const accused = action === 'UPHOLD'
      ? await db.collection('users').findOne({ id: Number(accused_user_id), role: 'PASSENGER' })
      : null;
    if (action === 'UPHOLD' && !accused) {
      return NextResponse.json({ error: 'Accused passenger not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const status = action === 'UPHOLD' ? 'UPHELD' : action === 'DISMISS' ? 'DISMISSED' : 'INFO_REQUESTED';
    const resolution = {
      action,
      manager_id: decoded.userId,
      accused_user_id: accused_user_id ? Number(accused_user_id) : null,
      fine_amount: Number(fine_amount) || 0,
      score_penalty: action === 'UPHOLD' ? Number(score_penalty) : 0,
      notes: notes?.trim() || null,
      resolved_at: now,
    };

    await db.collection('complaints').updateOne(
      { id: complaintId },
      { $set: { status, resolution, updated_at: now } }
    );

    if (action === 'UPHOLD') {
      const score = Math.max(0, Math.min(100, (accused.good_human_score ?? 100) - Number(score_penalty)));
      await db.collection('users').updateOne(
        { id: Number(accused_user_id) },
        { $set: { good_human_score: score }, $inc: { outstanding_fines: Number(fine_amount) || 0 } }
      );
    }

    await db.collection('audit_logs').insertOne({
      action: `COMPLAINT_${status}`,
      actor_id: decoded.userId,
      complaint_id: complaintId,
      timestamp: now,
      details: `${status}; fine ₹${Number(fine_amount) || 0}; score penalty ${resolution.score_penalty}`,
    });

    return NextResponse.json({ message: `Complaint ${status.toLowerCase()}`, status, resolution });
  } catch (err) {
    console.error('Complaint review error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
