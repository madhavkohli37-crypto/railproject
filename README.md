# RailAssist

RailAssist is a full-stack Indian Railway assistance and passenger civic-management platform built with **Next.js, React, MongoDB, and JWT authentication**.

Passengers can book verified railway assistance services such as porter, wheelchair, and meet-and-greet support. The platform also provides a civic reporting system for disruptive or uncivilised activity on trains and railway platforms. Authorized complaint managers and administrators review reports, evidence, penalties, account impacts, manager messages, and appeals.

This project is an application-level prototype. Real railway deployment must follow applicable railway rules, privacy requirements, legal requirements, and due-process procedures.

## Features

### Passenger features

- Signup and login with JWT authentication
- Unique display user ID, for example `U-42`
- Porter, wheelchair, and meet-and-greet booking
- Automatic provider assignment by service type, station, and availability
- Booking history and cancellation
- Provider/job status tracking
- Passenger profile and Good Human Score display
- Priority booking eligibility
- Passenger benefits based on Good Human Score
- Civic activity reporting from `/report`
- Image evidence upload
- Complaint status and complaint logs
- Private account and complaint notifications
- Complete accused-passenger case details when a complaint is upheld against the account
- Appeal and re-review request for an upheld decision

### Provider features

- Provider login
- Assigned-job dashboard
- Availability toggle
- Job status updates

### Complaint manager features

- Dedicated `MANAGER` role and portal
- Complaint queue with evidence and incident details
- Reporter identification by unique user ID instead of reporter name
- Accused passenger identification by user ID
- Category-based default fine and score penalty
- Custom fine and score penalty overrides
- Uphold, dismiss, reject as spam/false, or request more information
- Written review explanation
- Separate private message for the reporter
- Separate private message for the accused passenger
- Appeal review and written appeal decision

### Administrator features

- Master admin portal
- User, employee, provider, booking, application, and settings management
- Full complaint queue access
- Complaint review and appeal decisions
- Audit log access
- Complaint and account oversight

## Passenger Civic Reporting System

Passengers can use **Report Activity** from the dashboard or open `/report` directly. Reports may cover:

- Spitting or littering
- Smoking or substance use
- Harassment or abusive behaviour
- Blocking seats, aisles, or platforms
- Other uncivilised or disruptive activity

A report contains a category, description, station, optional train number, optional platform or coach, incident date/time, and up to five image files. The browser and API validate image type and size. Passengers should report observable facts, avoid confrontation, and contact railway or emergency authorities directly when there is an immediate safety threat.

Each report receives a complaint ID. The reporter can see their complaint history. If a complaint is upheld against an identified passenger, that accused passenger can also see the complete case details, including the description, location, train/platform details, evidence images, decision, fine, score penalty, and manager explanation.

## Complaint lifecycle

```text
Passenger observes activity
          ↓
Passenger submits report and evidence
          ↓
Complaint enters manager/admin review queue
          ↓
Reviewer checks facts and evidence
          ↓
 ┌───────────────────────┐
 │ Request more info     │
 │ Dismiss                │
 │ Reject as spam/false  │
 │ Uphold as genuine     │
 └───────────────────────┘
          ↓
If upheld: identify accused passenger
          ↓
Apply fine and/or score penalty
          ↓
Notify affected passengers
          ↓
Accused passenger may submit an appeal
          ↓
Manager/admin accepts or denies appeal
```

A report does not automatically punish anyone. Only an authorized manager or administrator can apply a fine or Good Human Score penalty.

## Complaint review decisions

| Action | Meaning |
| --- | --- |
| `UPHOLD` | Evidence supports the complaint. An identified passenger receives the configured fine and score penalty. |
| `DISMISS` | The complaint cannot be established or has insufficient evidence. |
| `REJECT_SPAM` | The complaint is found to be false or abusive. The reporter receives the configured spam-report score penalty. |
| `REQUEST_INFO` | The reviewer needs additional information before resolving the complaint. |
| `ACCEPT_APPEAL` | The appeal is accepted. The original fine is reversed and the deducted score is restored. |
| `DENY_APPEAL` | The appeal is denied and the original decision remains active. |

When reviewing a complaint, the manager can write:

1. Internal review notes explaining the decision.
2. A private message for the person who submitted the complaint.
3. A private message for the accused passenger.

Each passenger receives only the message intended for that passenger through their notifications and complaint log.

## Appeals and re-review

An accused passenger can appeal an upheld complaint from **My Complaint Logs**. The passenger must provide an objection of at least 10 characters. Only one pending appeal can exist at a time.

The complaint manager or administrator can review a pending appeal. A written explanation is required when accepting or denying it.

- **Accepted appeal:** the fine is reversed, the deducted Good Human Score points are restored, and both account impacts are notified.
- **Denied appeal:** the original decision remains active and the accused passenger receives the appeal explanation.

## Good Human Score

Every newly created passenger account starts with:

```text
Good Human Score = 400 / 1000
```

Scores are clamped between `0` and `1000`. An upheld complaint can reduce the accused passenger's score. A genuine upheld complaint rewards the reporter with `+5`. A complaint rejected as spam or false reduces the reporter's score by `25`.

Score bands are **Low (0–199, red)**, **Safe (200–499, yellow)**, **Good (500–749, green)**, and **Excellent (750–1000, deep green)**. The safe threshold is 200. `RailCoins` are a separate, spendable balance and never substitute for the score. Currently, passengers earn +5 RailCoins when a manager upholds their genuine report (+5 Good Human Score). Unverified, duplicate, and spam reports do not earn coins.

The **RailAssist Rewards Store** offers separate Premium durations: 1 day, 1 week, 1 month, 3 months, 6 months, and 1 year. The main landing page also explains Premium and links users to the plan selector. Each plan displays both its RailCoins price and an INR money price for future activation.

The home-page Premium plan buttons currently open `/premium/apply` with the selected plan. Passengers submit their name, email, phone, expected usage, and reason for wanting Premium. Applications are stored with `PENDING` status for review; payment and activation are not processed yet.

### Default category penalties

| Category | Default fine | Default score penalty |
| --- | ---: | ---: |
| Spitting or littering | ₹500 | 50 |
| Smoking or substance use | ₹1,000 | 75 |
| Harassment or abusive behaviour | ₹1,500 | 100 |
| Blocking seats, aisles, or platforms | ₹300 | 30 |
| Other uncivilised activity | ₹500 | 50 |

Managers can override the default fine and score penalty during review. Scores never fall below zero or above 1000.

## Priority booking and benefits

Passengers with a Good Human Score of **700 or above** are eligible to request priority booking. Eligibility does not guarantee capacity or availability; the normal booking and operational checks still apply.

Potential high-score benefits include:

- Priority booking
- Discounts
- Occasional complimentary food
- Faster service handling
- Other administrator-configured benefits

The current application enforces the `700+` priority threshold. Benefits beyond priority eligibility are policy concepts and should be configured before production use.

## Notifications

Notifications are created for relevant complaint outcomes and account impacts, including:

- Fine applied
- Good Human Score reduction or reward
- New resulting score
- Complaint dismissal
- Request for more information
- Spam/false complaint outcome
- Appeal submission
- Appeal acceptance or denial
- Private manager messages

Passengers can view notifications in the dashboard. Notifications are scoped to the authenticated passenger.

## User identity and privacy

Every account has a numeric database ID and a display ID formatted as `U-<id>`, such as `U-42`.

- Signup and login responses include the display user ID.
- Complaint records use `reporter_id`.
- The manager queue displays the reporter's user ID instead of their name.
- Passenger complaint access is limited to complaints submitted by that passenger or upheld complaints where that passenger is the accused user.
- Legacy `reporter_name` values are removed from complaint API responses.

Complaint evidence and passenger information should only be available to authorized users. Passengers should not confront, threaten, or publicly identify an accused person.

## Default accounts

Development administrator, employee, and complaint-manager credentials are documented in [`admin.md`](./admin.md). The default complaint manager account is:

```text
Email: manager@railassist.com
Password: 0000
Role: MANAGER
```

Change development credentials before any shared or production deployment. Do not commit production credentials.

## API reference

All API routes are implemented in `src/app/api/`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | No | Register a passenger |
| `POST` | `/api/auth/login` | No | Authenticate a passenger, provider, manager, or admin |
| `GET` | `/api/auth/me` | Authenticated | Return the current user |
| `GET` | `/api/stations` | No | List stations |
| `POST` | `/api/bookings` | Authenticated | Create a service booking |
| `GET` | `/api/bookings/my` | Passenger | List the passenger's bookings |
| `PATCH` | `/api/bookings/:id/cancel` | Passenger | Cancel an eligible booking |
| `POST` | `/api/provider/apply` | No | Submit a provider application |
| `GET` | `/api/provider/dashboard` | Provider | List assigned jobs |
| `PATCH` | `/api/provider/availability` | Provider | Update provider availability |
| `PATCH` | `/api/provider/job/:id/status` | Provider | Update an assigned job |
| `GET` | `/api/admin/dashboard` | Admin | Load admin statistics and records |
| `POST` | `/api/admin/employees` | Admin | Create an employee |
| `DELETE` | `/api/admin/employees/:id` | Admin | Remove an employee |
| `GET` | `/api/admin/applications` | Admin | List provider applications |
| `PATCH` | `/api/admin/applications/:id` | Admin | Approve or reject an application |
| `PATCH` | `/api/admin/settings` | Admin | Update admin credentials |
| `POST` | `/api/complaints` | Passenger | Submit a complaint with optional images |
| `GET` | `/api/complaints` | Passenger/Manager/Admin | List complaints scoped by role |
| `PATCH` | `/api/complaints/:id` | Manager/Admin | Resolve a complaint or decide an appeal |
| `POST` | `/api/complaints/:id/appeal` | Accused passenger | Submit an appeal for re-review |
| `GET` | `/api/notifications` | Authenticated | List private notifications |
| `GET` | `/api/rewards/catalog` | Passenger | List active coupons, premium plans, and reward configuration |
| `GET` | `/api/rewards/state` | Passenger | Read score band, safe threshold, coins, and active plan |
| `GET` | `/api/rewards/history` | Passenger | Read private redemption and score ledgers |
| `POST` | `/api/rewards/redeem` | Passenger | Atomically redeem a coupon or plan with RailCoins |
| `GET` | `/api/admin/rewards` | Admin | View reward catalog and plans |
| `PATCH` | `/api/admin/rewards` | Admin | Update safe reward fields (catalog/plans remain DB-configurable) |

The complaint review endpoint accepts `reporter_message` and `accused_message` fields for private recipient-specific messages.

The existing admin portal does not yet include a dedicated reward-editor screen; administrators can use the protected reward configuration endpoint or update the seeded MongoDB catalog. Booking priority continues to use the existing 700+ policy, not the 200 safe threshold.

## Project structure

```text
railassist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── complaints/
│   │   │   │   └── [id]/appeal/
│   │   │   ├── notifications/
│   │   │   ├── provider/
│   │   │   └── admin/
│   │   ├── dashboard/
│   │   ├── report/
│   │   ├── book/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── porter-apply/
│   │   ├── about/
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   ├── context/
│   └── lib/
│       ├── auth.js
│       ├── axiosInstance.js
│       └── db.js
├── admin.md
├── next.config.js
├── package.json
├── tailwind.config.js
└── techstack.md
```

## Database collections

The default MongoDB database is `railassist`. The application uses:

- `users` — passenger, provider, manager, and administrator accounts
- `bookings` — booking requests, assignments, statuses, and priority decisions
- `coolies` — seeded porter/provider records
- `sequences` — numeric ID counters
- `audit_logs` — administrative, booking, complaint, and appeal activity
- `complaints` — reports, evidence, resolutions, private manager messages, and appeals
- `notifications` — private account-impact and manager-message notifications

Passwords are stored as bcrypt hashes. `.env.local` and production credentials must never be committed.

## Authentication and authorization

Supported roles are:

```text
PASSENGER
PROVIDER
MANAGER
ADMIN
```

Protected API routes verify the JWT and role before performing sensitive operations. Passengers can access only their own bookings, notifications, and relevant complaint records. Managers and administrators can review complaints. Administrators have master-portal access.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Styling | Tailwind CSS 3 |
| Database | MongoDB |
| Database driver | Official MongoDB Node.js driver |
| Authentication | JWT and bcryptjs |
| HTTP client | Axios |

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Community Edition or MongoDB Atlas

## Environment variables

Create `.env.local` in the repository root:

```env
MONGODB_URI=mongodb://localhost:27017/railassist
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string.

## Getting started

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Build and start production:

```bash
npm run build
npm start
```

The first database connection creates the required collections and seeds the configured development accounts. See [`admin.md`](./admin.md) for credential and account-management details.

## Security and operational considerations

The prototype includes JWT authentication, bcrypt password hashing, role checks, image validation, upload limits, and audit logging. A production deployment should additionally add:

- Complaint rate limiting
- Duplicate complaint detection
- Stronger image/object-storage handling
- Fine payment and fine-status tracking
- Configurable policy administration
- Score-change history collection
- Email/SMS or push delivery
- Railway staff verification
- Abuse and fraud detection
- Legal and privacy review

Never commit:

```text
.env.local
```

## Disclaimer

RailAssist's Good Human Score, fines, priority booking, discounts, complimentary food, and other benefits are configurable application concepts. In a production railway deployment, passenger identification, penalties, fines, priority allocation, and benefits must operate under applicable railway rules, legal requirements, privacy regulations, and due-process procedures.

## License

This project is intended for educational, demonstration, and prototype purposes unless otherwise specified by the project owner.
