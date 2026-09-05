const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB, nextId } = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/auth/signup
// ---------------------------------------------------------------------------
router.post('/signup', async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  
  try {
    const db = getDB();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'This email is already registered. Please login.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const userId = await nextId('users');
    
    // Public signups are ALWAYS PASSENGER
    const user = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      phone: phone || null,
      role: 'PASSENGER',
      created_at: new Date().toISOString(),
    };

    await db.collection('users').insertOne(user);

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, email: user.email, role: user.role || 'PASSENGER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role || 'PASSENGER' },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /api/auth/me — protected
// ---------------------------------------------------------------------------
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({ id: req.user.userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const { password_hash, ...safe } = user;
    res.json(safe);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
