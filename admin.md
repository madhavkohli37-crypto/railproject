# 🔐 RailAssist — Admin & Employee Credentials

> [!CAUTION]
> This file contains **sensitive credentials**. Do NOT share this publicly or commit it to a public repository.
> Store it securely and delete/rotate credentials after first use.

---

## 🛡️ Master Admin (System Administrator)

| Field    | Value                     |
|----------|---------------------------|
| Email    | `admin@railassist.com`    |
| Password | `0000`                    |
| Role     | `ADMIN` — Full system access, manage employees, view all bookings and audit logs, change own credentials. |

---

## 👷 Default Employee Account

| Field    | Value                        |
|----------|------------------------------|
| Email    | `employee1@railassist.com`   |
| Password | `0000`                       |
| Station  | New Delhi                    |
| Type     | PORTER                       |
| Role     | `PROVIDER` — Sees assigned jobs, updates status, toggles availability. |

---

## 🔑 How to Change Admin Credentials

1. Log in as Admin at `http://your-app-url/login`.
2. Select **"Master Admin"** from the role selector.
3. Go to the **Master Portal** (`/dashboard`).
4. Navigate to the **Settings** tab.
5. Update your email and/or password and click Save.

---

## 📝 Notes

- New employees are created exclusively through the **Master Portal → Employees** tab.
- Passengers register through the public `/signup` page and are assigned the `PASSENGER` role automatically.
- The `/signup` page is **restricted** to passenger accounts only. Admin and Employee accounts cannot be self-created.
