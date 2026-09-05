# RailAssist — Tech Stack Documentation

This document outlines the complete technology stack, libraries, architecture, and deployment setup used in the RailAssist web application.

---

## 1. Core Framework & Architecture

The application has been unified into a single, high-performance **full-stack Next.js** application using the **App Router**.

* **Framework:** **Next.js 16+** (JavaScript / React 19)
* **Architecture:** Full-Stack Serverless Web Application
  * **Frontend:** Next.js Client Components (`'use client'`) with React Hooks (`useState`, `useEffect`, `useContext`).
  * **Backend:** Native Next.js **Route Handlers** (`src/app/api/...`) running as serverless functions.
* **Styling & Design System:**
  * **Tailwind CSS 3**: Responsive utility-first styling.
  * **Dark Mode**: Integrated class-based dark mode (`darkMode: 'class'`) with persistent state in `localStorage` and `ThemeContext`.
  * **Custom Keyframes & Animations**: Fade-in, slide-up, and realistic loading spinners.

---

## 2. API & Backend Route Handlers

All backend routes are implemented as native Next.js Route Handlers in `src/app/api/`:
* **Authentication:**
  * `POST /api/auth/signup` — Passenger registration with secure bcrypt password hashing.
  * `POST /api/auth/login` — Unified login for Passengers, Providers, and Admins with JWT issuance.
  * `GET /api/auth/me` — Protected session verification.
* **Stations & Assistance:**
  * `GET /api/stations` — Station lookups.
  * `POST /api/bookings` — Booking requests with automatic provider assignment and audit logging.
  * `GET /api/bookings/my` — Passenger booking history.
  * `PATCH /api/bookings/[id]/cancel` — Booking cancellation with provider release.
* **Provider (Employee Portal):**
  * `GET /api/provider/dashboard` — Assigned jobs and earnings.
  * `PATCH /api/provider/availability` — Toggle online/busy status.
  * `PATCH /api/provider/job/[id]/status` — Check-in, check-out, accept, and complete jobs.
* **Admin (Master Portal):**
  * `GET /api/admin/dashboard` — Full system overview, statistics, audit logs, and bookings.
  * `POST /api/admin/employees` — Creation of employee accounts.
  * `DELETE /api/admin/employees/[id]` — Removal of employees.

---

## 3. Database & Persistence

* **Database:** **MongoDB Atlas** (Cloud Cluster) / MongoDB Community.
* **Driver:** Official MongoDB Node.js Driver (`mongodb`).
* **Serverless Connection Pooling:**
  * Global client caching in `src/lib/db.js` (`global._mongoClient`, `global._mongoDb`) ensures database connections are reused across serverless function invocations without exhausting connection limits on Vercel.
* **Auto-Seeding:**
  * Automatically provisions the default system administrator (`admin@railassist.com` / `0000`), a default employee (`employee1@railassist.com` / `0000`), and stations on first run.

---

## 4. Deployment on Vercel (1-Step Process)

Because the app is built with Next.js, deployment to Vercel is seamless:

1. Push this repository to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and import the repository.
3. In **Environment Variables**, add:
   * `MONGODB_URI` = `mongodb+srv://wildcat123_:17ggs%4011@cluster0.3iicg8h.mongodb.net/railassist`
   * `JWT_SECRET` = `railassist_super_secret_jwt_key_2024`
4. Click **Deploy**. Both the frontend and backend will be live on your `.vercel.app` domain with zero extra configuration.
