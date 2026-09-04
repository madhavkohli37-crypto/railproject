const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB, closeDB } = require('./db');
const authRoutes = require('./routes/auth');
const coolieRoutes = require('./routes/coolie');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
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
app.use('/api', coolieRoutes);

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
    
    app.listen(PORT, () => {
      console.log(`\n🚂 RailAssist API Server`);
      console.log(`✅ Running on http://localhost:${PORT}`);
      console.log(`📖 API docs: http://localhost:${PORT}/\n`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM received, shutting down gracefully...');
      await closeDB();
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
