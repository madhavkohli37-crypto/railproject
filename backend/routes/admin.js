const express = require('express');
const { getDB } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
  
  try {
    const db = getDB();
    const bookings = await db.collection('bookings').find({}).sort({ created_at: -1 }).toArray();
    const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
    const audit_logs = await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).toArray();
    
    const providers = users.filter(u => u.role === 'PROVIDER');
    const passengers = users.filter(u => u.role === 'PASSENGER');

    res.json({
      bookings,
      users: passengers,
      providers,
      audit_logs,
      stats: {
        total_bookings: bookings.length,
        completed_bookings: bookings.filter(b => b.status === 'COMPLETED').length,
        pending_bookings: bookings.filter(b => ['REQUESTED', 'ASSIGNED', 'PARTIALLY_ASSIGNED'].includes(b.status)).length,
        active_bookings: bookings.filter(b => b.status === 'IN_PROGRESS').length,
        total_users: passengers.length,
        total_employees: providers.length,
        active_providers: providers.filter(p => p.available).length
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Employee
router.post('/employees', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
  
  const { name, email, password, provider_type, station } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { getDB, nextId } = require('../db');
    const bcrypt = require('bcryptjs');
    const db = getDB();

    const existing = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await nextId('users');

    const newEmployee = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'PROVIDER',
      provider_type: provider_type || 'PORTER',
      station: station || 'New Delhi',
      available: true,
      rating: 5.0,
      completed_jobs: 0,
      earnings: 0,
      price_per_bag: provider_type === 'PORTER' ? 60 : undefined,
      base_rate: provider_type === 'WHEELCHAIR' ? 150 : (provider_type === 'MEET_AND_GREET' ? 250 : undefined),
      created_at: new Date().toISOString(),
    };

    await db.collection('users').insertOne(newEmployee);
    res.status(201).json({ message: 'Employee created' });
  } catch (err) {
    console.error('Create employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Employee
router.delete('/employees/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Access denied' });
  
  try {
    const { getDB } = require('../db');
    const db = getDB();
    const id = parseInt(req.params.id);

    await db.collection('users').deleteOne({ id, role: 'PROVIDER' });
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error('Delete employee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
