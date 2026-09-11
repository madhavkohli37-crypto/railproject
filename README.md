# RailAssist

RailAssist is a full-stack Indian Railway assistance and passenger-civic-management platform built with **Next.js, React, MongoDB, and JWT authentication**.

The platform allows passengers to book verified railway assistance services such as porters, wheelchair assistance, and meet-and-greet services. It also introduces a **Passenger Civic Reporting System** where passengers can report uncivilised or disruptive activities occurring on trains or railway platforms.

Reported incidents can be reviewed by authorized railway managers and administrators. Verified misconduct can result in fines, a reduction in the passenger's **Good Human Score**, loss of priority-booking privileges, and other account-level consequences.

Passengers who maintain a high Good Human Score can receive priority booking and additional benefits.

The application is implemented as a single **Next.js App Router** project, with frontend pages and backend API route handlers maintained in the same repository.

---

# Features

## Passenger Features

* Passenger signup and login
* JWT-based authentication
* Passenger dashboard
* Booking of:

  * Porter assistance
  * Wheelchair assistance
  * Meet-and-greet assistance
* Automatic provider assignment based on:

  * Service type
  * Railway station
  * Provider availability
* Booking history
* Booking cancellation
* Provider/job status tracking
* Passenger profile
* Good Human Score visibility
* Priority booking eligibility
* Passenger benefits based on Good Human Score
* Civic activity reporting
* Complaint history and status tracking
* Image-based evidence submission

---

# Passenger Civic Reporting System

RailAssist provides passengers with a dedicated system for reporting activities that negatively affect other passengers or railway cleanliness and safety.

Passengers can report incidents such as:

* Spitting inside trains or stations
* Littering
* Smoking in prohibited areas
* Creating unnecessary disturbances
* Blocking entrances or passageways
* Damaging railway property
* Harassing or disturbing other passengers
* Creating excessive nuisance
* Other uncivilised or disruptive activities

The objective of this system is to provide a structured mechanism through which passengers can report incidents instead of confronting other passengers themselves.

## Reporting an Incident

Passengers can access the **Report Activity** option from their dashboard or through the `/report` page.

A complaint can contain:

* Type of misconduct
* Description of the incident
* Train number/name
* Coach number
* Seat number, when applicable
* Railway station
* Platform number
* Date and time
* Location of the incident
* Optional passenger identification details
* Image evidence
* Additional information for the reviewing authority

Passengers can upload photographic evidence along with their complaint.

The system validates uploaded images before accepting them and associates them with the complaint record.

A passenger can subsequently view their submitted complaints through the **My Complaint Logs** section.

---

# Complaint Lifecycle

Every submitted complaint follows a structured review process.

```text
Passenger observes misconduct
          ↓
Passenger submits complaint
          ↓
Images + incident details stored
          ↓
Complaint enters Manager Review Queue
          ↓
Manager investigates evidence
          ↓
┌──────────────────────────────────┐
│                                  │
│ Dismissed     More Information   │
│                                  │
│            OR                    │
│                                  │
│         Misconduct Upheld        │
└──────────────────────────────────┘
                  ↓
        Identify responsible user
                  ↓
      Apply appropriate penalty
                  ↓
     Fine and/or Score Reduction
                  ↓
      Passenger account updated
```

A complaint should not automatically result in punishment simply because another passenger submitted a report.

Authorized reviewers must evaluate the available evidence before taking action.

---

# Manager Complaint Review Portal

A dedicated **Manager Portal** is provided for authorized railway managers.

Managers can:

* View pending complaints
* Search complaints
* Filter complaints by status
* Filter complaints by misconduct type
* View incident details
* View uploaded image evidence
* View train and station information
* Review the reporting passenger's information
* Identify the accused passenger where sufficient information exists
* Review the accused passenger's Good Human Score
* Review previous upheld complaints
* Request additional information
* Dismiss unsupported complaints
* Uphold verified complaints
* Apply fines
* Reduce Good Human Score
* Add review notes
* Track complaint resolution history

Managers should base decisions on available evidence and should not penalize passengers solely on the basis of an unverified accusation.

---

# Administrator Complaint Management

Administrators have complete oversight of the complaint-management system through the **Master/Admin Portal**.

Administrators can:

* View all complaints
* Review complaints independently
* Review manager decisions
* Uphold or dismiss complaints
* Modify or reverse complaint resolutions when authorized
* Apply or remove fines
* Modify Good Human Score penalties
* View complaint history
* View passenger information
* View manager review activity
* Monitor complaint statistics
* Review audit logs
* Investigate potentially abusive or fraudulent reports

The administrator has higher-level control over the complaint system and can audit actions performed by managers.

---

# Good Human Score

Every passenger receives a **Good Human Score (GHS)** when their account is created.

### Default Score

```text
Good Human Score = 100
```

The score represents the passenger's civic and behavioural record within RailAssist.

The score can decrease when verified misconduct is established through the complaint-review process.

Scores can never fall below:

```text
0
```

## Example Penalty System

The exact penalties can be configured according to railway policy.

| Misconduct                 | Example Score Penalty |    Possible Fine |
| -------------------------- | --------------------: | ---------------: |
| Littering                  |                    -5 |             ₹100 |
| Spitting                   |                   -10 |             ₹200 |
| Smoking in prohibited area |                   -15 |             ₹500 |
| Creating major disturbance |                   -15 |             ₹500 |
| Property damage            |                   -25 |          ₹1,000+ |
| Serious misconduct         |      Policy dependent | Policy dependent |

These values are examples and should be configurable rather than hard-coded permanently.

Managers and administrators can select the appropriate penalty during complaint resolution.

---

# Good Human Score Levels

The passenger's score can be interpreted through different behavioural levels.

|  Score | Status      | Priority Booking    | Benefits                    |
| -----: | ----------- | ------------------- | --------------------------- |
| 90–100 | Excellent   | Highest eligibility | Maximum benefits            |
|  80–89 | Good        | Eligible            | Additional benefits         |
|  70–79 | Responsible | Eligible            | Standard priority benefits  |
|  50–69 | Warning     | Not eligible        | Benefits restricted         |
|  30–49 | Poor        | Not eligible        | Fines/restrictions possible |
|   0–29 | Critical    | Not eligible        | Strong restrictions         |

The exact thresholds and benefits should remain configurable by the railway/RailAssist administration.

---

# Priority Booking

A passenger's Good Human Score can influence their eligibility for priority booking.

Passengers meeting the configured minimum score may request priority booking.

For example:

```text
Good Human Score >= 70
        ↓
Priority Booking Eligible
        ↓
Priority request can be submitted
        ↓
System checks availability and policy
        ↓
Priority booking granted if eligible
```

Priority eligibility does not guarantee that a seat or service will always be available.

The booking system should continue to respect actual railway capacity and applicable operational rules.

---

# Passenger Benefits

Maintaining a high Good Human Score can provide additional benefits.

Potential benefits include:

* Priority booking access
* Priority assistance requests
* Discounts
* Promotional offers
* Occasional complimentary food
* Faster service handling
* Additional RailAssist rewards
* Recognition for consistently responsible behaviour

Benefits should be configurable from the administrator portal so that railway policy can change them without requiring major application changes.

---

# Score Degradation

The Good Human Score is intended to reflect a passenger's long-term behavioural record.

A verified misconduct incident can reduce the passenger's score.

The system should maintain a complete history of score changes.

Example:

```text
Passenger Score
100
 ↓
Spitting complaint upheld
 ↓
-10
 ↓
90
 ↓
Littering complaint upheld
 ↓
-5
 ↓
85
```

Every score modification should be recorded with:

* Previous score
* Penalty/reward amount
* New score
* Reason
* Complaint ID
* Reviewer ID
* Timestamp

This makes the scoring system auditable.

---

# Complaint Statuses

Complaints can move through the following states:

```text
PENDING
   ↓
UNDER_REVIEW
   ↓
├── DISMISSED
├── INFORMATION_REQUESTED
└── UPHELD
        ↓
   PENALTY_APPLIED
```

Possible complaint statuses include:

* `PENDING`
* `UNDER_REVIEW`
* `INFORMATION_REQUESTED`
* `UPHELD`
* `DISMISSED`
* `PENALTY_APPLIED`

---

# Complaint Review Actions

Managers and administrators can perform actions such as:

### Dismiss Complaint

Used when:

* Evidence is insufficient
* The incident cannot be verified
* The complaint is invalid
* The reported activity does not violate policy

### Request Information

Used when additional information is required before making a decision.

### Uphold Complaint

Used when the available evidence establishes that misconduct occurred.

An upheld complaint may result in:

* Good Human Score reduction
* Fine
* Booking restrictions
* Loss of benefits
* Other configured penalties

---

# Complaint Abuse Prevention

Because the system allows passengers to report other passengers, mechanisms should be implemented to prevent misuse.

The platform should support:

* Complaint rate limiting
* Duplicate complaint detection
* Reporter identity tracking
* Evidence validation
* Manager review before penalties
* Audit logs
* False-report monitoring
* Administrator review
* Abuse detection for repeated fraudulent complaints

Passengers should not be able to directly penalize another passenger.

Only authorized managers and administrators can apply penalties.

---

# Privacy and Safety

Passenger reporting is intended to improve railway behaviour and passenger experience.

Passengers should:

* Report observable facts
* Upload relevant evidence
* Avoid confrontation
* Avoid threatening or harassing the accused person
* Avoid unnecessary collection of private information
* Contact railway/security authorities directly when there is an immediate safety threat

Complaint evidence and passenger information should only be accessible to authorized personnel.

---

# API Reference

All API routes are implemented in `src/app/api/`.

| Method | Endpoint                           | Auth                    | Description                                                   |
| ------ | ---------------------------------- | ----------------------- | ------------------------------------------------------------- |
| POST   | `/api/auth/signup`                 | No                      | Register a passenger                                          |
| POST   | `/api/auth/login`                  | No                      | Authenticate a passenger, provider, manager, or admin         |
| GET    | `/api/auth/me`                     | Bearer token            | Return the current user                                       |
| GET    | `/api/stations`                    | No                      | List stations with available providers                        |
| POST   | `/api/bookings`                    | Bearer token            | Create a service booking                                      |
| GET    | `/api/bookings/my`                 | Bearer token            | List the passenger's bookings                                 |
| PATCH  | `/api/bookings/:id/cancel`         | Bearer token            | Cancel a passenger booking                                    |
| POST   | `/api/provider/apply`              | No                      | Submit a provider application                                 |
| GET    | `/api/provider/dashboard`          | Provider                | List assigned jobs                                            |
| PATCH  | `/api/provider/availability`       | Provider                | Update provider availability                                  |
| PATCH  | `/api/provider/job/:id/status`     | Provider                | Update an assigned job                                        |
| GET    | `/api/admin/dashboard`             | Admin                   | Load admin statistics and records                             |
| POST   | `/api/admin/employees`             | Admin                   | Create an employee                                            |
| DELETE | `/api/admin/employees/:id`         | Admin                   | Remove an employee                                            |
| GET    | `/api/admin/applications`          | Admin                   | List provider applications                                    |
| PATCH  | `/api/admin/applications/:id`      | Admin                   | Approve or reject an application                              |
| PATCH  | `/api/admin/settings`              | Admin                   | Update admin credentials                                      |
| POST   | `/api/complaints`                  | Passenger               | Submit an uncivilised-activity complaint with optional images |
| GET    | `/api/complaints`                  | Passenger/Manager/Admin | Retrieve complaints according to user role                    |
| GET    | `/api/complaints/:id`              | Passenger/Manager/Admin | View complaint details                                        |
| PATCH  | `/api/complaints/:id`              | Manager/Admin           | Review, uphold, dismiss, or request information               |
| GET    | `/api/admin/complaints`            | Admin                   | Retrieve the complete complaint-management queue              |
| PATCH  | `/api/admin/complaints/:id`        | Admin                   | Override or resolve a complaint                               |
| GET    | `/api/score/:userId`               | Authorized User         | Retrieve Good Human Score and history                         |
| PATCH  | `/api/score/:userId`               | Manager/Admin           | Apply an authorized score adjustment                          |
| GET    | `/api/admin/score/:userId/history` | Admin                   | View complete score history                                   |

---

# Project Structure

```text
railassist/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── complaints/
│   │   │   ├── provider/
│   │   │   ├── score/
│   │   │   └── admin/
│   │   ├── about/
│   │   ├── book/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── report/
│   │   ├── porter-apply/
│   │   ├── signup/
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   ├── context/
│   └── lib/
│       ├── auth.js
│       ├── axiosInstance.js
│       ├── db.js
│       └── score.js
├── admin.md
├── next.config.js
├── package.json
├── tailwind.config.js
└── techstack.md
```

---

# Database

The MongoDB database is named:

```text
railassist
```

The application uses the following collections:

### `users`

Stores:

* Passenger accounts
* Provider accounts
* Manager accounts
* Administrator accounts
* Authentication information
* User roles
* Good Human Score
* Booking eligibility
* Account restrictions
* Benefit eligibility

Passwords must always be stored as secure bcrypt hashes and must never be stored in plaintext.

### `bookings`

Stores:

* Passenger booking requests
* Service type
* Station
* Assigned provider
* Booking status
* Priority-booking information
* Timestamps

### `coolies`

Stores seeded and registered porter/provider information.

### `sequences`

Stores numeric ID counters.

### `audit_logs`

Stores administrative and system activity.

### `complaints`

Stores:

* Reporter
* Accused passenger, when identified
* Complaint type
* Description
* Train information
* Station/platform information
* Incident timestamp
* Evidence references
* Complaint status
* Manager review
* Administrator review
* Fine information
* Score penalty
* Resolution details
* Timestamps

### `score_history`

Stores every Good Human Score modification.

Each record should contain:

```text
userId
previousScore
change
newScore
reason
complaintId
reviewerId
reviewerRole
timestamp
```

This ensures that score changes remain auditable.

---

# Authentication and Authorization

RailAssist uses JWT authentication with role-based authorization.

Supported roles include:

```text
PASSENGER
PROVIDER
MANAGER
ADMIN
```

### Passenger

Can:

* Book services
* View bookings
* Cancel eligible bookings
* Submit complaints
* View own complaints
* View own Good Human Score
* Request priority booking if eligible

### Provider

Can:

* View assigned jobs
* Update availability
* Update job status

### Manager

Can:

* Access complaint review
* Investigate reports
* Review evidence
* Identify responsible passengers
* Request information
* Dismiss complaints
* Uphold complaints
* Apply authorized penalties

### Admin

Can:

* Manage users
* Manage providers
* Manage employees
* Manage applications
* Review all complaints
* Override manager decisions
* Manage Good Human Score
* Manage fines and penalties
* Configure system settings
* Review audit logs

All protected API endpoints must verify the authenticated user's role before allowing sensitive operations.

---

# Fines

When a complaint is upheld, an authorized reviewer may apply a fine according to the configured policy.

A fine record should contain:

```text
complaintId
passengerId
amount
reason
createdBy
createdAt
status
```

The system should maintain the fine independently from the complaint so that payment and administrative status can be tracked.

Possible fine states include:

```text
PENDING
PAID
WAIVED
CANCELLED
```

---

# Priority Booking Architecture

Priority booking should not bypass actual railway capacity.

The system should first determine whether the passenger is eligible:

```text
Good Human Score
        ↓
Eligibility Check
        ↓
Priority Eligible?
     /       \
   YES        NO
    ↓          ↓
Priority     Standard
Request      Booking
```

The booking system can additionally consider:

* Train availability
* Seat availability
* Service availability
* Passenger score
* Existing restrictions
* Railway policies
* Administrative configuration

---

# Security Considerations

The application should follow secure development practices.

Important security requirements include:

* Password hashing using bcrypt
* JWT authentication
* Role-based authorization
* Protected admin endpoints
* Protected manager endpoints
* Input validation
* Image file validation
* Upload size restrictions
* Complaint rate limiting
* Audit logging
* No plaintext password storage
* No exposure of authentication secrets
* Environment variables for secrets
* Secure MongoDB configuration
* Authorization checks on every complaint and score operation

Never commit:

```text
.env.local
```

or production credentials to the repository.

---

# Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/railassist
JWT_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For MongoDB Atlas, replace `MONGODB_URI` with the Atlas connection string.

---

# Requirements

* Node.js 18 or newer
* npm
* MongoDB Community Edition or MongoDB Atlas

---

# Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

For a production build:

```bash
npm run build
npm start
```

The first database connection creates the required collections and seeds the configured development accounts.

See `admin.md` for development administrator and employee credentials and account-management instructions.

---

# Civic Reporting Workflow Example

A typical incident can flow through the system as follows:

```text
Passenger notices someone spitting inside a train
                    ↓
Passenger opens "Report Activity"
                    ↓
Selects "Spitting"
                    ↓
Enters train/coach/location details
                    ↓
Uploads photographic evidence
                    ↓
Submits complaint
                    ↓
Complaint ID generated
                    ↓
Manager receives complaint
                    ↓
Manager reviews evidence
                    ↓
Responsible passenger identified
                    ↓
Complaint upheld
                    ↓
Example:
₹200 fine
-10 Good Human Score
                    ↓
Passenger score:
100 → 90
                    ↓
Penalty recorded in audit history
```

---

# Good Human Score Example

A passenger begins with:

```text
100 Good Human Score
```

After verified misconduct:

```text
Spitting
-10
────────
90
```

Later:

```text
Littering
-5
────────
85
```

The passenger remains eligible for configured benefits while above the required priority-booking threshold.

If the score eventually falls below the configured threshold:

```text
85
 ↓
Multiple verified violations
 ↓
65
 ↓
Priority booking disabled
 ↓
Benefits restricted
```

The passenger's score and complete history remain visible to the passenger, while sensitive review information is restricted to authorized personnel.

---

# Future Improvements

Potential future enhancements include:

* Automated duplicate complaint detection
* AI-assisted complaint categorization
* AI-assisted image analysis
* Real-time manager notifications
* QR-based complaint reporting
* Railway staff verification
* Digital fine payment
* Passenger reward points
* Good Human Score recovery through positive behaviour
* Reward badges
* Station cleanliness analytics
* Complaint heat maps
* Train-wise incident analytics
* Fraudulent-report detection
* Automated escalation for serious incidents
* Integration with official railway systems
* Push notifications
* Email/SMS complaint updates

---

# Disclaimer

RailAssist's Good Human Score, fines, priority booking, discounts, complimentary food, and other benefits are application-level concepts and should be treated as configurable policy mechanisms.

In a production railway deployment, penalties, passenger identification, fines, priority allocation, and benefits must operate according to applicable railway rules, legal requirements, privacy regulations, and due-process procedures.

The complaint system should be designed to discourage vigilantism and false reporting. Passengers should report incidents safely and allow authorized personnel to investigate and take appropriate action.

---

# License

This project is intended for educational, demonstration, and prototype purposes unless otherwise specified by the project owner.
