# RailAssist Setup Complete ✅

## What I've Done

### 1. **Migrated Database from lowdb to MongoDB**
   - Replaced lowdb JSON file storage with MongoDB (mongodb://localhost:27017/railassist)
   - Updated backend dependencies: removed `lowdb`, added `mongodb`
   - Created MongoDB-aware database module (`db.js`) with:
     - Connection pooling
     - Automatic collection creation
     - Auto-seeding of 16 coolies across major stations
     - Async/await support for all database operations

### 2. **Updated All Backend Routes for MongoDB**
   - **auth.js**: Updated signup, login, and /me routes to use MongoDB
   - **coolie.js**: Updated all endpoints (stations, coolies, bookings, cancellations)
   - All database calls now use MongoDB native driver with proper error handling

### 3. **Created Root Package.json for Easy Server Start**
   - Single `npm start` command starts both backend and frontend simultaneously
   - Uses `concurrently` to run both servers
   - Additional scripts available:
     - `npm run dev`: Runs backend and frontend in dev mode with hot reload
     - `npm run start:backend`: Backend only
     - `npm run start:frontend`: Frontend only
     - `npm run build`: Builds frontend for production

### 4. **Updated Server Configuration**
   - Backend server (`server.js`) now initializes MongoDB connection before listening
   - Graceful shutdown handling for MongoDB cleanup
   - Environment variables configured in `.env`:
     - `PORT=5000` (backend)
     - `JWT_SECRET=railassist_super_secret_jwt_key_2024`
     - `MONGODB_URI=mongodb://localhost:27017/railassist`

## Current Status

✅ **Backend**: Running on http://localhost:5000
✅ **Frontend**: Running on http://localhost:5174
✅ **Database**: MongoDB connected and seeded

## How to Start the Application

```bash
# From the project root directory
npm start
```

This will start:
- Backend API on port 5000
- Frontend React dev server on port 5174 (or next available port)

## Frontend-Backend Integration

The frontend is already configured to proxy API calls to the backend:
- All `/api/*` requests are forwarded to `http://localhost:5000`
- This is configured in `frontend/vite.config.js`
- CORS is enabled on the backend for `localhost:5173` and `localhost:3000`

## Database Collections

MongoDB will automatically create these collections in the `railassist` database:

- **users**: Stores user accounts (id, email, password_hash, phone, created_at)
- **coolies**: Railway porters (id, name, station, badge_number, phone, rating, price_per_bag, experience_years, available)
- **bookings**: User bookings (id, user_id, coolie_id, station, train_number, bags_count, status, total_price, created_at)
- **sequences**: Auto-increment sequences for IDs

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` [protected] - Get current user info

### Coolies
- `GET /api/stations` - List all stations
- `GET /api/coolies?station=Mumbai%20CST` - List available coolies (optional station filter)
- `GET /api/coolies/:id` - Get specific coolie details

### Bookings
- `POST /api/bookings` [protected] - Create booking
- `GET /api/bookings/my` [protected] - Get user's bookings
- `PATCH /api/bookings/:id/cancel` [protected] - Cancel booking

## Requirements

- Node.js 18+ installed
- MongoDB running on localhost:27017
- npm installed

## Notes

- The frontend proxy is configured to work with both Vite dev server (port 5173/5174) and production builds
- JWT tokens are valid for 7 days
- All passwords are hashed with bcryptjs (10 salt rounds)
- The application includes 16 pre-seeded railway porters across major Indian stations
