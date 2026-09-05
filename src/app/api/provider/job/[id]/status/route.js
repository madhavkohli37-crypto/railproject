import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const decoded = verifyToken(req);
  if (!decoded || decoded.role !== 'PROVIDER') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const { id } = await params;
  const bookingId = parseInt(id);

  try {
    const { status } = await req.json();
    const db = await getDB();
    const booking = await db.collection('bookings').findOne({ id: bookingId });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const serviceIndex = booking.services.findIndex(s => s.provider_id === decoded.userId);
    if (serviceIndex === -1) {
      return NextResponse.json({ error: 'You are not assigned to this booking' }, { status: 403 });
    }

    booking.services[serviceIndex].status = status;
    const now = new Date().toISOString();

    if (status === 'IN_PROGRESS') {
      booking.services[serviceIndex].check_in_time = now;
      if (!booking.check_in_time) booking.check_in_time = now;
    }
    if (status === 'COMPLETED') {
      booking.services[serviceIndex].check_out_time = now;
    }

    if (status === 'REJECTED' || status === 'COMPLETED') {
      await db.collection('users').updateOne(
        { id: decoded.userId },
        { $set: { available: true } }
      );
      if (status === 'REJECTED') {
        booking.services[serviceIndex].provider_id = null;
      }
      if (status === 'COMPLETED') {
        await db.collection('users').updateOne(
          { id: decoded.userId },
          { $inc: { earnings: booking.services[serviceIndex].price, completed_jobs: 1 } }
        );
      }
    }

    const allCompleted = booking.services.every(s => s.status === 'COMPLETED');
    const allAccepted = booking.services.every(s => s.status === 'ACCEPTED' || s.status === 'COMPLETED');
    const anyInProgress = booking.services.some(s => s.status === 'IN_PROGRESS');
    const anyAssignedOrRequested = booking.services.some(s => s.status === 'ASSIGNED' || s.status === 'REQUESTED');

    if (allCompleted) {
      booking.status = 'COMPLETED';
      booking.check_out_time = now;
    } else if (anyInProgress) {
      booking.status = 'IN_PROGRESS';
    } else if (allAccepted) {
      booking.status = 'ACCEPTED';
    } else if (!anyAssignedOrRequested) {
      booking.status = 'REJECTED_OR_CANCELLED';
    }

    booking.updated_at = now;

    await db.collection('bookings').updateOne(
      { id: bookingId },
      {
        $set: {
          services: booking.services,
          status: booking.status,
          check_in_time: booking.check_in_time,
          check_out_time: booking.check_out_time,
          updated_at: booking.updated_at
        }
      }
    );

    await db.collection('audit_logs').insertOne({
      action: `JOB_STATUS_UPDATED_${status}`,
      actor_id: decoded.userId,
      booking_id: bookingId,
      timestamp: now,
      details: `Provider updated service status to ${status}`
    });

    return NextResponse.json({ message: 'Job status updated', status });
  } catch (err) {
    console.error('Update job status error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
