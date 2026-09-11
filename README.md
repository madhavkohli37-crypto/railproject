# RailAssist

RailAssist is a full-stack Indian Railway assistance platform for booking verified porters, wheelchair assistance, and meet-and-greet services.

The application is implemented as a single **Next.js App Router** project. The frontend pages and backend API route handlers live in the same repository.

## Features

- Passenger signup and login with JWT authentication
- Porter, wheelchair, and meet-and-greet booking requests
- Automatic provider assignment by service type, station, and availability
- Passenger dashboard with booking history and cancellation
- Provider dashboard for availability and job status updates
- Admin portal for bookings, users, employees, applications, settings, and audit logs
- MongoDB persistence with automatic collection setup and seed accounts
- Responsive Tailwind CSS interface with persistent light/dark mode
- Passenger incident reporting with image evidence and complaint tracking
- Manager and admin complaint review with fines and Good Human Score penalties
- Score-based priority booking eligibility and passenger benefits

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16+ App Router |
| UI | React 19 |
| Styling | Tailwind CSS 3 |
| Database | MongoDB |
| Database driver | Official MongoDB Node.js driver |
| Authentication | JWT and bcryptjs |
| HTTP client | Axios |

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Community or MongoDB Atlas

## Getting Started

Install dependencies from the repository root:

```bash
npm install
```

Create a local `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/railassist
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Create a production build and run it with:

```bash
npm run build
npm start
```

The first database connection creates the required collections and seeds the default administrator, employee, and porter records. See `admin.md` for the current development credentials and account-management instructions.

## API Reference

All API routes are implemented in `src/app/api/`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Register a passenger |
| POST | `/api/auth/login` | No | Authenticate a passenger, provider, or admin |
| GET | `/api/auth/me` | Bearer token | Return the current user |
| GET | `/api/stations` | No | List stations with available providers |
| POST | `/api/bookings` | Bearer token | Create a service booking |
| GET | `/api/bookings/my` | Bearer token | List the passenger's bookings |
| PATCH | `/api/bookings/:id/cancel` | Bearer token | Cancel a passenger booking |
| POST | `/api/provider/apply` | No | Submit a provider application |
| GET | `/api/provider/dashboard` | Provider | List assigned jobs |
| PATCH | `/api/provider/availability` | Provider | Update provider availability |
| PATCH | `/api/provider/job/:id/status` | Provider | Update an assigned job |
| GET | `/api/admin/dashboard` | Admin | Load admin statistics and records |
| POST | `/api/admin/employees` | Admin | Create an employee |
| DELETE | `/api/admin/employees/:id` | Admin | Remove an employee |
| GET | `/api/admin/applications` | Admin | List provider applications |
| PATCH | `/api/admin/applications/:id` | Admin | Approve or reject an application |
| PATCH | `/api/admin/settings` | Admin | Update admin credentials |
| POST | `/api/complaints` | Passenger | Register an uncivilised-activity complaint with optional images |
| GET | `/api/complaints` | Passenger/Manager/Admin | Passengers see their own complaint logs; reviewers see all complaints |
| PATCH | `/api/complaints/:id` | Manager/Admin | Uphold, dismiss, or request information |

## Project Structure

```text
railassist/
├── src/
│   ├── app/
│   │   ├── api/                 # Next.js API route handlers
│   │   ├── about/               # About page
│   │   ├── book/                # Passenger booking page
│   │   ├── dashboard/           # Passenger, provider, and admin dashboards
│   │   ├── login/               # Login page
│   │   ├── porter-apply/        # Provider application page
│   │   ├── signup/              # Passenger signup page
│   │   ├── globals.css          # Tailwind layers and shared components
│   │   ├── layout.jsx           # Root layout, providers, navbar, and footer
│   │   └── page.jsx             # Landing page
│   ├── components/              # Shared React components
│   ├── context/                 # Auth and theme providers
│   └── lib/
│       ├── auth.js              # JWT signing and verification
│       ├── axiosInstance.js     # Browser API client and auth interceptor
│       └── db.js                # MongoDB connection, setup, and seed data
├── admin.md                     # Development admin and employee credentials
├── next.config.js
├── package.json
├── tailwind.config.js
└── techstack.md
```

## Database

The MongoDB database is named `railassist`. The application uses these collections:

- `users` — passengers, providers, and administrators
- `bookings` — booking requests and service assignment data
- `coolies` — seeded porter records
- `sequences` — numeric ID counters
- `audit_logs` — administrative and booking activity
- `complaints` — passenger reports, image evidence, and review resolutions

## Civic Reporting and Good Human Score

Passengers can use `/report` or **Report Activity** from their dashboard to report spitting, littering, smoking, harassment, obstruction, or another uncivilised activity on a train or platform. A report includes the station, optional train/platform details, a description, and up to five image files. Images are validated in the browser and stored with the complaint record as evidence.

Passengers can view the status and review outcome of their own reports in the **My Complaint Logs** section of their dashboard. The API scopes passenger requests to the authenticated reporter; managers and administrators retain access to the full review queue.

Every passenger starts with a **Good Human Score of 100**. A manager or administrator can review evidence and either dismiss a complaint, request more information, or uphold it against an identified passenger. An upheld complaint may add a fine and reduce the accused passenger's score. Scores never fall below zero.

Passengers with a score of **70 or above** may request priority booking benefits. Lower scores do not receive priority eligibility; the booking record stores whether priority was requested and whether it was approved. The exact operational benefits, such as priority handling, discounts, or occasional complimentary food, remain subject to railway and RailAssist policy.

The manager portal is available through `/dashboard` after signing in with the `MANAGER` role. Administrators have a **Complaints** tab in the master portal and can perform the same review actions. Reports should describe observable facts, and passengers should never confront or identify people at personal risk.

Set `MONGODB_URI` to an Atlas connection string when deploying. Do not commit `.env.local` or production credentials.
