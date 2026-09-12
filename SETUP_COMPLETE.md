# RailAssist Setup Guide

RailAssist is configured as a single Next.js application with MongoDB persistence. There is no separate Express backend or Vite frontend.

## Current Architecture

- **Next.js App Router** serves both the UI and API route handlers.
- **React 19** powers client components and dashboards.
- **Tailwind CSS 3** provides styling, responsive layouts, and dark mode.
- **MongoDB** stores users, bookings, providers, sequences, and audit logs.
- **JWT and bcryptjs** provide authentication and password hashing.
- **Complaint review** supports passenger evidence reports, manager decisions, admin oversight, fines, and Good Human Score adjustments.

## Installation

From the repository root:

```bash
npm install
```

The available package scripts are:

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm start         # Start the production server
```

## Environment Variables

Create `.env.local` in the repository root:

```env
MONGODB_URI=mongodb://localhost:27017/railassist
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For MongoDB Atlas, replace `MONGODB_URI` with the cluster connection string. Use a strong, unique production value for `JWT_SECRET`.

## Database Initialization

`src/lib/db.js` maintains a cached MongoDB client and initializes the database on the first connection. It:

- Creates the `users`, `coolies`, `bookings`, and `sequences` collections when needed.
- Seeds the default administrator and employee accounts.
- Seeds 16 porter records across the supported stations when the porter collection is empty.
- Seeds a complaints manager account for the review portal.
- Provides numeric IDs through the `sequences` collection.

The application also writes booking and provider-application activity to `audit_logs`.

## Running Locally

1. Ensure MongoDB is running locally, or configure a reachable MongoDB Atlas database.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open `http://localhost:3000`.

The UI and API are served by the same Next.js process. API requests use the `/api` path and do not require a Vite proxy or a second server.

## Main Routes

### Pages

- `/` — landing page
- `/about` — platform information
- `/signup` — passenger registration
- `/login` — passenger, provider, and admin login
- `/book` — passenger service request form
- `/dashboard` — role-specific dashboard
- `/porter-apply` — provider application form
- `/report` — passenger uncivilised-activity report form

### API

- `/api/auth/*` — signup, login, and session verification
- `/api/stations` — station lookup
- `/api/bookings/*` — create, list, and cancel bookings
- `/api/provider/*` — applications, availability, dashboard, and job updates
- `/api/admin/*` — administration, employees, applications, and settings
- `/api/complaints` — submit and review incident complaints; passengers can also retrieve their own complaint logs

## Good Human Score and Priority Booking

Passengers start with a Good Human Score of 400 on a 0–1000 scale. Managers and administrators can uphold genuine complaints against an identified passenger, apply a category-based fine and score penalty, reject complaints as spam (reducing the reporter by 25), dismiss complaints for insufficient evidence, or request more information. A score of 700 or higher makes a passenger eligible to request priority booking; genuine reports reward the reporter with +5. The booking stores both the request and approval decision.

Every account receives a unique display user ID such as `U-42`. Complaint queues show the reporter's user ID instead of their name, and the complaint API strips stored legacy reporter names from responses.

Every reviewed complaint creates an account notification for the affected reporter and accused passenger. Notifications include the decision, fine, score change, resulting score, and any separate manager message intended for that person. Accused passengers can view the complete incident details, evidence, manager explanation, and penalty, then submit an appeal. Managers can accept or deny pending appeals and must provide review notes for the decision.

Passenger reports may include up to five image files smaller than 1.5 MB each. The application stores their data with the complaint, so production deployments should use suitable MongoDB storage limits and a dedicated object-storage service if evidence volume grows.

## Deployment

For Vercel:

1. Import the repository as a Next.js project.
2. Configure `MONGODB_URI`, `JWT_SECRET`, and optionally `NEXT_PUBLIC_SITE_URL`.
3. Deploy using the default Next.js build settings.

MongoDB must allow connections from the deployment environment. Keep environment variables out of source control and rotate any development credentials before production use.

See `README.md` for the complete API table and `techstack.md` for the detailed architecture reference.
