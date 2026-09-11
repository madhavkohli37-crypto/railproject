import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const userId = parseInt(params.id);
    const { action, notes } = await req.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 });
    }

    const db = await getDB();
    const user = await db.collection('users').findOne({ id: userId });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'VERIFIED' : 'REJECTED';
    const updateData = {
      verification_status: newStatus,
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: decoded.userId,
      verification_notes: notes || (action === 'approve' ? 'ID verified successfully.' : 'Uploaded document was unreadable or invalid.'),
    };

    await db.collection('users').updateOne(
      { id: userId },
      { $set: updateData }
    );

    // Audit log
    await db.collection('audit_logs').insertOne({
      action: action === 'approve' ? 'PASSENGER_ID_VERIFIED' : 'PASSENGER_ID_REJECTED',
      actor_id: decoded.userId,
      booking_id: null,
      timestamp: new Date().toISOString(),
      details: `Admin ${action}d Aadhaar verification for passenger ${user.name} (U-${userId}). Notes: ${updateData.verification_notes}`,
    });

    return NextResponse.json({
      message: `Passenger Aadhaar verification ${action}d successfully.`,
      status: newStatus,
    });
  } catch (err) {
    console.error('Verify passenger error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
