# RailAssist — Tech Stack

This document describes the current architecture, libraries, persistence model, and deployment configuration for RailAssist.

## 1. Core Framework and Architecture

RailAssist is a full-stack **Next.js App Router** application.

- **Framework:** Next.js 16+
- **Language:** JavaScript
- **UI:** React 19 client and server components
- **Backend:** Native Next.js Route Handlers under `src/app/api/`
- **Styling:** Tailwind CSS 3 with class-based dark mode
- **Client state:** React Context and Hooks
- **Browser API client:** Axios

The frontend and backend are served by the same Next.js process. There is no separate Express server or Vite application.

## 2. Application Surfaces

### Passenger

- Passenger signup and login
- Station and service selection
- Porter, wheelchair, and meet-and-greet booking
- Booking history and cancellation

### Provider

- Public provider application
- Approval-gated employee login
- Availability toggle
- Assigned job dashboard
- Accept, reject, start, and complete job actions

### Admin

- System statistics and booking overview
- Passenger and provider records
- Employee creation and removal
- Provider application approval and rejection
- Audit log access
- Admin credential settings

## 3. API Route Handlers

All handlers are located in `src/app/api/`.

- **Authentication:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/me`
- **Stations:** `/api/stations`
- **Bookings:** `/api/bookings`, `/api/bookings/my`, `/api/bookings/[id]/cancel`
- **Providers:** `/api/provider/apply`, `/api/provider/dashboard`, `/api/provider/availability`, `/api/provider/job/[id]/status`
- **Administration:** `/api/admin/dashboard`, `/api/admin/employees`, `/api/admin/employees/[id]`, `/api/admin/applications`, `/api/admin/applications/[id]`, `/api/admin/settings`

Protected handlers read JWTs from the `Authorization: Bearer <token>` request header and authorize requests by role.

## 4. Database and Persistence

- **Database:** MongoDB Atlas or MongoDB Community
- **Driver:** Official MongoDB Node.js driver
- **Database name:** `railassist`
- **Connection module:** `src/lib/db.js`
- **Authentication:** `bcryptjs` password hashing and `jsonwebtoken` tokens

The database module caches the MongoDB client and database handle for reuse across serverless invocations. On first connection it creates the required collections and seeds:

- The default administrator
- The default employee
- 16 porter records across supported stations
- Numeric ID sequences

The main collections are:

- `users` — passengers, providers, and administrators
- `bookings` — booking requests and service assignment data
- `coolies` — porter records
- `sequences` — numeric ID counters
- `audit_logs` — booking, application, and administrative activity

## 5. Environment Variables

Configure these values in `.env.local` for local development or in the deployment provider:

```env
MONGODB_URI=mongodb://localhost:27017/railassist
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Use a strong, unique `JWT_SECRET` and a production MongoDB connection string when deploying. Never commit actual credentials or connection strings.

## 6. Deployment on Vercel

Because the project is a standard Next.js application:

1. Import the repository into Vercel.
2. Configure `MONGODB_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL`.
3. Use the default Next.js build settings.
4. Deploy.

MongoDB must allow connections from the Vercel deployment environment. The default build command is `next build`, and the production server is started with `next start`.
