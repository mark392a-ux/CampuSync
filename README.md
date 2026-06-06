# 🎓 CampuSync — Smart Campus Leave Management System

<p align="center">

Modern campus leave management platform built using **Next.js, Supabase, TypeScript, and Tailwind CSS**

</p>

<p align="center">

![NextJS](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Supabase](https://img.shields.io/badge/Supabase-green)
![License](https://img.shields.io/badge/license-MIT-purple)

</p>

---

# 🌐 Live Demo

**Deployed App**

```text
https://YOUR-VERCEL-URL.vercel.app
```

---

# 📸 Screenshots

## Landing Page

![Landing Page](./screenshots/landing.png)

## Student Dashboard

![Student Dashboard](./screenshots/student-dashboard.png)

## Leave Application

![Leave Application](./screenshots/leave-application.png)

## Faculty Review Panel

![Faculty Dashboard](./screenshots/faculty-review.png)

## Admin Dashboard

![Admin Dashboard](./screenshots/admin-dashboard.png)

---

# ✨ Features

## Authentication & Security

* Secure authentication using Supabase Auth
* Role-based access control
* Protected routes
* Row Level Security (RLS)

## Student Features

* Apply for leave requests
* Upload attachments/documents
* Track leave status
* View leave history
* Responsive dashboard

## Faculty Features

* Review pending requests
* Approve / Reject leaves
* Add reviewer remarks
* View leave history

## Admin Features

* View all leave requests
* Analytics dashboard
* User management
* Full system visibility

## UI / UX

* Dark / Light Mode
* Mobile Responsive
* Modern dashboard interface
* Interactive tables
* Toast notifications

---

# 🛠 Tech Stack

| Category       | Technology            |
| -------------- | --------------------- |
| Frontend       | Next.js + TypeScript  |
| Styling        | Tailwind CSS          |
| Backend        | Supabase              |
| Database       | PostgreSQL            |
| Authentication | Supabase Auth         |
| Storage        | Supabase Storage      |
| Forms          | React Hook Form + Zod |
| Tables         | TanStack Table        |
| Icons          | Lucide                |

---

# 🏗 Architecture

```text
Users
 ↓
Next.js Frontend
 ↓
Supabase Auth
 ↓
PostgreSQL Database
 ↓
Storage + RLS Policies
```

---

# 🚀 Quick Start

## Clone Repository

```bash
git clone https://github.com/mark392a-ux/CampuSync.git

cd CampuSync
```

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=
```

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🗃 Database Structure

## Profiles Table

```text
id
email
full_name
role
department
avatar_url
```

## Leaves Table

```text
student_id
leave_type
start_date
end_date
reason
attachment_url
status
reviewed_by
reviewer_remark
```

---

# 📁 Project Structure

```text
app/
components/
lib/
types/
supabase/
```

---

# 🚀 Deployment

## Vercel

```bash
npm run build
```

Deploy using:

```text
Vercel Dashboard
↓
Import Repository
↓
Add Environment Variables
↓
Deploy
```

---

# 🧪 Test Accounts

Signup normally and select role:

```text
Student
Faculty
Admin
```

For production:

```sql
UPDATE profiles
SET role='admin'
WHERE email='admin@example.com';
```

---

# 🤝 Contributing

Pull requests are welcome.

---

# 📄 License

MIT License

---

<p align="center">

Built with ❤️ using Next.js + Supabase

</p>
