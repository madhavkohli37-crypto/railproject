import { NextResponse } from 'next/server';
import { getDB, nextId, DEFAULT_GOOD_HUMAN_SCORE } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

const ACTIONS = ['UPHOLD', 'DISMISS', 'REJECT_SPAM', 'REQUEST_INFO', 'ACCEPT_APPEAL', 'DENY_APPEAL'];
const DEFAULT_PENALTIES = {
  'Spitting or littering': { fine: 500, score: 50 },
  'Smoking or substance use': { fine: 1000, score: 75 },
  'Harassment or abusive behaviour': { fine: 1500, score: 100 },
  'Blocking seats, aisles, or platforms': { fine: 300, score: 30 },
  'Other uncivilised activity': { fine: 500, score: 50 },
};

async function createNotification(db, userId, title, message, complaintId, impact) {
  await db.collection('notifications').insertOne({
    id: await nextId('notifications', db),
    user_id: userId,
    title,
    message,
    complaint_id: complaintId,
    impact,
    read: false,
    created_at: new Date().toISOString(),
  });
}

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || !['MANAGER', 'ADMIN'].includes(decoded.role)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const complaintId = parseInt((await params).id, 10);
    const body = await req.json();
    const { action, accused_user_id, fine_amount, score_penalty, notes, reporter_message, accused_message } = body;
    if (!ACTIONS.includes(action)) return NextResponse.json({ error: 'Invalid complaint action' }, { status: 400 });

    const db = await getDB();
    const complaint = await db.collection('complaints').findOne({ id: complaintId });
    if (!complaint) return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    const appealAction = ['ACCEPT_APPEAL', 'DENY_APPEAL'].includes(action);
    if (appealAction && (!complaint.appeal || complaint.appeal.status !== 'PENDING')) {
      return NextResponse.json({ error: 'No pending appeal exists for this complaint' }, { status: 409 });
    }
    if (!appealAction && !['OPEN', 'INFO_REQUESTED'].includes(complaint.status)) {
      return NextResponse.json({ error: 'This complaint has already been resolved' }, { status: 409 });
    }

    const defaults = DEFAULT_PENALTIES[complaint.category] || DEFAULT_PENALTIES['Other uncivilised activity'];
    const fineAmount = fine_amount === '' || fine_amount === undefined ? defaults.fine : Number(fine_amount);
    const scorePenalty = score_penalty === '' || score_penalty === undefined ? defaults.score : Number(score_penalty);
    if (!Number.isInteger(fineAmount) || fineAmount < 0 || !Number.isInteger(scorePenalty) || scorePenalty < 0 || scorePenalty > 1000) {
      return NextResponse.json({ error: 'Fine and score penalty must be whole, non-negative numbers' }, { status: 400 });
    }
    if (action === 'UPHOLD' && !Number.isInteger(Number(accused_user_id))) {
      return NextResponse.json({ error: 'An accused passenger is required for a genuine complaint' }, { status: 400 });
    }
    if (appealAction && !notes?.trim()) {
      return NextResponse.json({ error: 'A written explanation is required when deciding an appeal' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const accused = action === 'UPHOLD'
      ? await db.collection('users').findOne({ id: Number(accused_user_id), role: 'PASSENGER' })
      : null;
    if (action === 'UPHOLD' && !accused) return NextResponse.json({ error: 'Accused passenger not found' }, { status: 404 });

    const status = action === 'UPHOLD' ? 'UPHELD' : action === 'REJECT_SPAM' ? 'REJECTED_SPAM' : action === 'DISMISS' ? 'DISMISSED' : action === 'REQUEST_INFO' ? 'INFO_REQUESTED' : action === 'ACCEPT_APPEAL' ? 'APPEAL_ACCEPTED' : 'APPEAL_DENIED';
    const resolution = {
      action,
      manager_id: decoded.userId,
      accused_user_id: accused_user_id ? Number(accused_user_id) : complaint.resolution?.accused_user_id || null,
      fine_amount: action === 'UPHOLD' ? fineAmount : 0,
      score_penalty: action === 'UPHOLD' ? scorePenalty : 0,
      reporter_score_change: action === 'UPHOLD' ? 5 : action === 'REJECT_SPAM' ? -25 : 0,
      notes: notes?.trim() || null,
      reporter_message: reporter_message?.trim() || null,
      accused_message: accused_message?.trim() || null,
      resolved_at: now,
    };

    if (appealAction) {
      const appeal = { ...complaint.appeal, status: action === 'ACCEPT_APPEAL' ? 'ACCEPTED' : 'DENIED', review_notes: notes?.trim() || null, reviewed_by: decoded.userId, reviewed_at: now };
      await db.collection('complaints').updateOne({ id: complaintId }, { $set: { status, appeal, updated_at: now } });
      const accusedId = complaint.resolution.accused_user_id;
      const accused = await db.collection('users').findOne({ id: accusedId });
      if (action === 'ACCEPT_APPEAL' && accused) {
        const restoredScore = Math.min(1000, (accused.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE) + complaint.resolution.score_penalty);
        const restoredFines = Math.max(0, (accused.outstanding_fines || 0) - (complaint.resolution.fine_amount || 0));
        await db.collection('users').updateOne({ id: accusedId }, { $set: { good_human_score: restoredScore, outstanding_fines: restoredFines } });
        const reporter = await db.collection('users').findOne({ id: complaint.reporter_id });
        if (reporter) await db.collection('users').updateOne({ id: reporter.id }, { $set: { good_human_score: Math.max(0, (reporter.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE) - complaint.resolution.reporter_score_change) } });
        await createNotification(db, accusedId, 'Appeal accepted', `Your appeal for complaint #${complaintId} was accepted. Your fine was reversed and ${complaint.resolution.score_penalty} Good Human Score points were restored.${accused_message?.trim() ? ` Message from the complaint manager: ${accused_message.trim()}` : ''}`, complaintId, { fine_reversed: complaint.resolution.fine_amount, score_change: complaint.resolution.score_penalty, new_score: restoredScore });
      } else {
        await createNotification(db, accusedId, 'Appeal denied', `Your appeal for complaint #${complaintId} was reviewed and denied. ${notes?.trim() || 'The original decision remains in effect.'}${accused_message?.trim() ? ` Message from the complaint manager: ${accused_message.trim()}` : ''}`, complaintId, { score_change: 0 });
      }
      await db.collection('audit_logs').insertOne({ action: `COMPLAINT_${status}`, actor_id: decoded.userId, complaint_id: complaintId, timestamp: now, details: notes?.trim() || status });
      return NextResponse.json({ message: `Appeal ${appeal.status.toLowerCase()}`, status, appeal });
    }

    await db.collection('complaints').updateOne({ id: complaintId }, { $set: { status, resolution, updated_at: now } });

    if (action === 'UPHOLD') {
      const accusedScore = Math.max(0, Math.min(1000, (accused.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE) - scorePenalty));
      await db.collection('users').updateOne({ id: accused.id }, { $set: { good_human_score: accusedScore }, $inc: { outstanding_fines: fineAmount } });
      await createNotification(db, accused.id, 'Complaint upheld against your account', `Complaint #${complaintId} was upheld. Fine: ₹${fineAmount}. Good Human Score reduced by ${scorePenalty} to ${accusedScore}.${accused_message?.trim() ? ` Message from the complaint manager: ${accused_message.trim()}` : ''}`, complaintId, { fine: fineAmount, score_change: -scorePenalty, new_score: accusedScore });
      const reporter = await db.collection('users').findOne({ id: complaint.reporter_id });
      if (reporter) {
        const reporterScore = Math.min(1000, (reporter.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE) + 5);
        await db.collection('users').updateOne({ id: reporter.id }, { $set: { good_human_score: reporterScore } });
        await createNotification(db, reporter.id, 'Thank you for your genuine report', `Complaint #${complaintId} was upheld. You received +5 Good Human Score; your new score is ${reporterScore}.${reporter_message?.trim() ? ` Message from the complaint manager: ${reporter_message.trim()}` : ''}`, complaintId, { score_change: 5, new_score: reporterScore });
      }
    } else if (action === 'REJECT_SPAM') {
      const reporter = await db.collection('users').findOne({ id: complaint.reporter_id, role: 'PASSENGER' });
      if (reporter) {
        const reporterScore = Math.max(0, (reporter.good_human_score ?? DEFAULT_GOOD_HUMAN_SCORE) - 25);
        await db.collection('users').updateOne({ id: reporter.id }, { $set: { good_human_score: reporterScore } });
        await createNotification(db, reporter.id, 'Complaint rejected as spam', `Complaint #${complaintId} was found to be false or spam. Your Good Human Score was reduced by 25 to ${reporterScore}.${reporter_message?.trim() ? ` Message from the complaint manager: ${reporter_message.trim()}` : ''}`, complaintId, { score_change: -25, new_score: reporterScore });
      }
    } else if (action === 'DISMISS') {
      await createNotification(db, complaint.reporter_id, 'Complaint dismissed', `Complaint #${complaintId} was dismissed because there was not enough evidence to proceed.${reporter_message?.trim() ? ` Message from the complaint manager: ${reporter_message.trim()}` : ''}`, complaintId, { score_change: 0 });
    } else {
      await createNotification(db, complaint.reporter_id, 'More information requested', `The review team needs more information for complaint #${complaintId}.${reporter_message?.trim() ? ` Message from the complaint manager: ${reporter_message.trim()}` : ''}`, complaintId, { score_change: 0 });
    }

    await db.collection('audit_logs').insertOne({ action: `COMPLAINT_${status}`, actor_id: decoded.userId, complaint_id: complaintId, timestamp: now, details: `${status}; fine ₹${resolution.fine_amount}; score penalty ${resolution.score_penalty}; reporter change ${resolution.reporter_score_change}` });
    return NextResponse.json({ message: `Complaint ${status.toLowerCase()}`, status, resolution });
  } catch (err) {
    console.error('Complaint review error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
