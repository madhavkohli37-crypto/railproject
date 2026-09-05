const express = require('express');
const { getDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/provider/dashboard
// ---------------------------------------------------------------------------
router.get('/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PROVIDER') return res.status(403).json({ error: 'Access denied' });
  
  try {
    const db = getDB();
    
    // Find bookings where this provider is assigned
    const bookings = await db.collection('bookings').find({
      'services.provider_id': req.user.userId
    }).sort({ created_at: -1 }).toArray();

    // Map bookings to only include the service this provider is responsible for
    const jobs = bookings.map(b => {
      const myService = b.services.find(s => s.provider_id === req.user.userId);
      return {
        booking_id: b.id,
        station: b.station,
        train_number: b.train_number,
        platform: b.platform,
        scheduled_at: b.scheduled_at,
        created_at: b.created_at,
        overall_status: b.status,
        passenger_id: b.user_id,
        ...myService
      };
    });

    res.json(jobs);
  } catch (err) {
    console.error('Provider dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/provider/availability
// ---------------------------------------------------------------------------
router.patch('/availability', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PROVIDER') return res.status(403).json({ error: 'Access denied' });
  const { available } = req.body;
  
  try {
    const db = getDB();
    await db.collection('users').updateOne(
      { id: req.user.userId },
      { $set: { available: !!available } }
    );
    res.json({ message: 'Availability updated', available: !!available });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/provider/job/:bookingId/status
// ---------------------------------------------------------------------------
router.patch('/job/:bookingId/status', authenticateToken, async (req, res) => {
  if (req.user.role !== 'PROVIDER') return res.status(403).json({ error: 'Access denied' });
  
  const bookingId = parseInt(req.params.bookingId);
  const { status } = req.body; // ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED

  try {
    const db = getDB();
    const booking = await db.collection('bookings').findOne({ id: bookingId });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Update the specific service status
    const serviceIndex = booking.services.findIndex(s => s.provider_id === req.user.userId);
    if (serviceIndex === -1) return res.status(403).json({ error: 'You are not assigned to this booking' });

    booking.services[serviceIndex].status = status;

    const now = new Date().toISOString();
    
    // Check-in and Check-out timestamps
    if (status === 'IN_PROGRESS') {
      booking.services[serviceIndex].check_in_time = now;
      if (!booking.check_in_time) booking.check_in_time = now; // overall check-in
    }
    if (status === 'COMPLETED') {
      booking.services[serviceIndex].check_out_time = now;
    }

    // If rejected, free up the provider
    if (status === 'REJECTED' || status === 'COMPLETED') {
      await db.collection('users').updateOne(
        { id: req.user.userId },
        { $set: { available: true } }
      );
      if (status === 'REJECTED') {
         booking.services[serviceIndex].provider_id = null; // Unassign
      }
      if (status === 'COMPLETED') {
         // Add earnings
         await db.collection('users').updateOne(
            { id: req.user.userId },
            { $inc: { earnings: booking.services[serviceIndex].price, completed_jobs: 1 } }
         );
      }
    }

    // Determine overall booking status based on all services
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

    // Audit Trail
    await db.collection('audit_logs').insertOne({
      action: `JOB_STATUS_UPDATED_${status}`,
      actor_id: req.user.userId,
      booking_id: bookingId,
      timestamp: now,
      details: `Provider updated service status to ${status}`
    });

    res.json({ message: 'Job status updated', status });
  } catch (err) {
    console.error('Update job status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
