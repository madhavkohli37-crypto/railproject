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
    const coolies = await db.collection('coolies').find({}).toArray();
    const stations = [...new Set(coolies.map(c => c.station))].sort();
    res.json(stations);
  } catch (err) {
    console.error('Error fetching stations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/coolies  [?station=Mumbai CST]
// ---------------------------------------------------------------------------
router.get('/coolies', async (req, res) => {
  try {
    const { station } = req.query;
    const db = getDB();
    
    const query = { available: true };
    
    if (station && station !== 'all') {
      const q = station.toLowerCase();
      query.station = { $regex: q, $options: 'i' };
    }
    
    const coolies = await db.collection('coolies')
      .find(query)
      .sort({ rating: -1 })
      .toArray();
    
    res.json(coolies);
  } catch (err) {
    console.error('Error fetching coolies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/coolies/:id
// ---------------------------------------------------------------------------
router.get('/coolies/:id', async (req, res) => {
  try {
    const db = getDB();
    const coolie = await db.collection('coolies').findOne({ id: parseInt(req.params.id) });
    if (!coolie) return res.status(404).json({ error: 'Coolie not found' });
    res.json(coolie);
  } catch (err) {
    console.error('Error fetching coolie:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/bookings — protected
// ---------------------------------------------------------------------------
router.post('/bookings', authenticateToken, async (req, res) => {
  const { coolie_id, station, train_number, platform, bags_count, scheduled_at } = req.body;

  if (!coolie_id || !station || !bags_count) {
    return res.status(400).json({ error: 'coolie_id, station, and bags_count are required' });
  }
  const count = parseInt(bags_count);
  if (isNaN(count) || count < 1 || count > 20) {
    return res.status(400).json({ error: 'bags_count must be between 1 and 20' });
  }

  try {
    const db = getDB();
    const coolie = await db.collection('coolies').findOne({ id: parseInt(coolie_id) });
    if (!coolie) return res.status(404).json({ error: 'Coolie not found' });
    if (!coolie.available) return res.status(409).json({ error: 'This coolie is not available' });

    const total_price = coolie.price_per_bag * count;
    const bookingId = await nextId('bookings');

    const booking = {
      id: bookingId,
      user_id: req.user.userId,
      coolie_id: coolie.id,
      station,
      train_number: train_number || null,
      platform: platform || null,
      bags_count: count,
      scheduled_at: scheduled_at || null,
      status: 'confirmed',
      total_price,
      created_at: new Date().toISOString(),
      coolie_name: coolie.name,
      badge_number: coolie.badge_number,
      coolie_phone: coolie.phone,
      rating: coolie.rating,
      price_per_bag: coolie.price_per_bag,
    };

    await db.collection('bookings').insertOne(booking);

    res.status(201).json({ message: 'Booking confirmed!', booking });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/bookings/my — protected
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
// PATCH /api/bookings/:id/cancel — protected
// ---------------------------------------------------------------------------
router.patch('/bookings/:id/cancel', authenticateToken, async (req, res) => {
  const bookingId = parseInt(req.params.id);
  
  try {
    const db = getDB();
    const booking = await db.collection('bookings').findOne({ 
      id: bookingId, 
      user_id: req.user.userId 
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(409).json({ error: 'Booking is already cancelled' });
    if (booking.status === 'completed') return res.status(409).json({ error: 'Cannot cancel a completed booking' });

    await db.collection('bookings').updateOne(
      { id: bookingId },
      { $set: { status: 'cancelled' } }
    );

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
