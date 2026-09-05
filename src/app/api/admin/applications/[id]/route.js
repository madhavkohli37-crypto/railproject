import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// PATCH /api/admin/applications/[id] — Approve or reject an application
export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const { action } = await req.json();
    const applicantId = parseInt(params.id);

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    const db = await getDB();
    const applicant = await db.collection('users').findOne({ id: applicantId, role: 'PROVIDER' });
    if (!applicant) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updates = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      available: action === 'approve' ? true : false,
      reviewed_at: new Date().toISOString(),
      reviewed_by: decoded.userId,
    };

    await db.collection('users').updateOne({ id: applicantId }, { $set: updates });

    // Audit log
    await db.collection('audit_logs').insertOne({
      action: action === 'approve' ? 'APPLICATION_APPROVED' : 'APPLICATION_REJECTED',
      actor_id: decoded.userId,
      booking_id: null,
      timestamp: updates.reviewed_at,
      details: `Admin ${action}d application of ${applicant.name} (${applicant.email}) for ${applicant.provider_type} at ${applicant.station}`,
    });

    return NextResponse.json({
      message: `Application ${action}d successfully.`,
      status: updates.status,
    });
  } catch (err) {
    console.error('Application action error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
