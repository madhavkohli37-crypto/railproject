# 🚂 RailAssist

A full-stack Indian Railway Companion app with **Coolie Booking** and **User Authentication**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | lowdb (JSON file-based, zero config) |
| Auth | JWT + bcrypt |

## Features

- ✅ **User Signup / Login** with JWT authentication
- ✅ **Browse Coolies** — 16 verified porters across 9 major stations
- ✅ **Station Filter** — filter coolies by station
- ✅ **Book a Coolie** — train number, platform, bags count, date/time
- ✅ **Dashboard** — stats, profile, booking history
- ✅ **Cancel Bookings** — with status tracking
- ✅ **Persistent Data** — stored in `backend/railassist.json`

## Stations Covered

Mumbai CST · New Delhi · Bengaluru City · Chennai Central · Kolkata Howrah  
Ahmedabad Junction · Pune Junction · Hyderabad Deccan · Kochi Central

---

## Getting Started

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 3. Start Backend (Terminal 1)
```bash
cd backend
node server.js
# Running at http://localhost:5000
```

### 4. Start Frontend (Terminal 2)
```bash
cd frontend
node node_modules/vite/bin/vite.js
# Running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT token |
| GET | `/api/auth/me` | ✅ | Get own profile |
| GET | `/api/stations` | ❌ | List all stations |
| GET | `/api/coolies` | ❌ | List coolies (filter: `?station=`) |
| GET | `/api/coolies/:id` | ❌ | Single coolie details |
| POST | `/api/bookings` | ✅ | Create a booking |
| GET | `/api/bookings/my` | ✅ | My bookings |
| PATCH | `/api/bookings/:id/cancel` | ✅ | Cancel a booking |

## Project Structure

```
railassist/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js              # lowdb database + seed data
│   ├── .env               # JWT secret & port config
│   ├── middleware/
│   │   └── auth.js        # JWT verification
│   └── routes/
│       ├── auth.js        # Signup, Login, /me
│       └── coolie.js      # Coolies + Bookings
└── frontend/
    ├── src/
    │   ├── App.jsx              # Router + protected routes
    │   ├── context/AuthContext.jsx
    │   ├── api/axiosInstance.js
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── CoolieCard.jsx
    │   │   └── BookingCard.jsx
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── LoginPage.jsx
    │       ├── SignupPage.jsx
    │       ├── Dashboard.jsx
    │       └── CoolieBooking.jsx
    └── vite.config.js     # Proxy /api → localhost:5000
```

> Data is stored in `backend/railassist.json`. Delete it to reset to seed data.
