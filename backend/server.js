const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, closeDB } = require('./db');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const providerRoutes = require('./routes/provider');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} — ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', bookingRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: '🚂 RailAssist API is running',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'GET  /api/auth/me  [protected]',
      ],
      coolies: [
        'GET /api/stations',
        'GET /api/coolies',
        'GET /api/coolies/:id',
      ],
      bookings: [
        'POST  /api/bookings          [protected]',
        'GET   /api/bookings/my       [protected]',
        'PATCH /api/bookings/:id/cancel [protected]',
      ]
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database and start server
async function startServer() {
  try {
    await connectDB();
    
    // Auto-seed admin and employee accounts if they don't exist
    const { getDB, nextId } = require('./db');
    const bcrypt = require('bcryptjs');
    const db = getDB();
    
    const adminExists = await db.collection('users').findOne({ email: 'admin@railassist.com' });
    if (!adminExists) {
      await db.collection('users').insertOne({
        id: await nextId('users'),
        name: 'System Admin',
        email: 'admin@railassist.com',
        password_hash: await bcrypt.hash('0000', 10),
        role: 'ADMIN',
        created_at: new Date().toISOString()
      });
      console.log('✅ Seeded default admin (admin@railassist.com / 0000)');
    }

    const employeeExists = await db.collection('users').findOne({ email: 'employee1@railassist.com' });
    if (!employeeExists) {
      await db.collection('users').insertOne({
        id: await nextId('users'),
        name: 'Ramu Porter',
        email: 'employee1@railassist.com',
        password_hash: await bcrypt.hash('0000', 10),
        role: 'PROVIDER',
        provider_type: 'PORTER',
        station: 'New Delhi',
        available: true,
        rating: 5.0,
        completed_jobs: 0,
        earnings: 0,
        price_per_bag: 60,
        created_at: new Date().toISOString()
      });
      console.log('✅ Seeded default employee (employee1@railassist.com / 0000)');
    }

    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`\n🚂 RailAssist API Server`);
        console.log(`✅ Running on http://localhost:${PORT}`);
        console.log(`📖 API docs: http://localhost:${PORT}/\n`);
      });
    }

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
      process.exit(1);
    }
  }
}

startServer();

module.exports = app;
