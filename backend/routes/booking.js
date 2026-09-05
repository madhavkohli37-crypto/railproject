const express = require('express');
const { getDB, nextId } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/stations
// ---------------------------------------------------------------------------
router.get('/stations', async (req, res) => {
  try {
    const db = getDB();
    const providers = await db.collection('users').find({ role: 'PROVIDER' }).toArray();
    const stations = [...new Set(providers.map(c => c.station))].filter(Boolean).sort();
    if (stations.length === 0) {
      stations.push('New Delhi', 'Mumbai CST', 'Bengaluru City'); // Fallbacks
    }
    res.json(stations);
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/bookings (Creates booking & Auto-assigns)
// ---------------------------------------------------------------------------
router.post('/bookings', authenticateToken, async (req, res) => {
  const { station, train_number, platform, services, scheduled_at } = req.body;
  
  if (!station || !services || !services.length) {
    return res.status(400).json({ error: 'Station and services are required' });
  }

  try {
    const db = getDB();
    const bookingId = await nextId('bookings');
    
    // Calculate total price based on services
    let total_price = 0;
    const requestedServices = services.map(srv => {
      let price = 0;
      if (srv.type === 'PORTER') price = (srv.bags_count || 1) * 60;
      else if (srv.type === 'WHEELCHAIR') price = 150;
      else if (srv.type === 'MEET_AND_GREET') price = 250;
      total_price += price;
      
      return {
        ...srv,
        price,
        status: 'REQUESTED', // REQUESTED, ASSIGNED, ACCEPTED, REJECTED, COMPLETED
        provider_id: null,
        provider_name: null,
      };
    });

    const booking = {
      id: bookingId,
      user_id: req.user.userId,
      station,
      train_number: train_number || null,
      platform: platform || null,
      scheduled_at: scheduled_at || null,
      services: requestedServices,
      status: 'REQUESTED', // REQUESTED, ASSIGNED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED
      total_price,
      created_at: new Date().toISOString(),
    };

    // Auto-assignment logic
    for (let i = 0; i < booking.services.length; i++) {
      const srv = booking.services[i];
      // Find an available provider of this type at this station
      const provider = await db.collection('users').findOne({
        role: 'PROVIDER',
        provider_type: srv.type,
        station: { $regex: new RegExp(`^${station}$`, 'i') },
        available: true
      });

      if (provider) {
        srv.provider_id = provider.id;
        srv.provider_name = provider.name;
        srv.provider_phone = provider.phone;
        srv.status = 'ASSIGNED';
        
        // Mark provider as busy (temporarily)
        await db.collection('users').updateOne(
          { id: provider.id },
          { $set: { available: false } }
        );
      }
    }

    // Check overall booking status
    const allAssigned = booking.services.every(s => s.status === 'ASSIGNED');
    const someAssigned = booking.services.some(s => s.status === 'ASSIGNED');
    if (allAssigned) booking.status = 'ASSIGNED';
    else if (someAssigned) booking.status = 'PARTIALLY_ASSIGNED';

    await db.collection('bookings').insertOne(booking);

    // Audit Trail
    await db.collection('audit_logs').insertOne({
      action: `BOOKING_CREATED`,
      actor_id: req.user.userId,
      booking_id: bookingId,
      timestamp: booking.created_at,
      details: `Passenger requested ${services.length} services at ${station}`
    });

    res.status(201).json({ message: 'Booking requested!', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/my
// ---------------------------------------------------------------------------
router.get('/bookings/my', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const bookings = await db.collection('bookings')
      .find({ user_id: req.user.userId })
      .sort({ created_at: -1 })
      .toArray();
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/bookings/:id/cancel
// ---------------------------------------------------------------------------
router.patch('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  try {
    const db = getDB();
    const booking = await db.collection('bookings').findOne({ id: bookingId, user_id: req.user.userId });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
      return res.status(409).json({ error: 'Booking cannot be cancelled' });
    }

    // Free up any assigned providers
    const providerIds = booking.services.filter(s => s.provider_id).map(s => s.provider_id);
    if (providerIds.length > 0) {
      await db.collection('users').updateMany(
        { id: { $in: providerIds } },
        { $set: { available: true } }
      );
    }

    const now = new Date().toISOString();
    await db.collection('bookings').updateOne(
      { id: bookingId },
      { $set: { status: 'CANCELLED', updated_at: now } }
    );

    // Audit Trail
    await db.collection('audit_logs').insertOne({
      action: `BOOKING_CANCELLED`,
      actor_id: req.user.userId,
      booking_id: bookingId,
      timestamp: now,
      details: `Passenger cancelled the booking`
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
