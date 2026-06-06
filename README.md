# 🎓 CampuSync

### Smart Campus Leave Management System

<p align="center">

Modern role-based campus leave management platform built using Next.js, Supabase, TypeScript, and Tailwind CSS.

</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge)

![TypeScript](https://img.shields.io/badge/TypeScript-Blue?style=for-the-badge)

![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge)

![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge)

![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)

</p>

---

# 🌐 Live Demo

### Try CampuSync Here

## https://campu-sync.vercel.app/

---

# 📚 Table of Contents

* Overview
* Features
* Screenshots
* Tech Stack
* Architecture
* Database Structure
* Installation
* Environment Variables
* Running Locally
* Deployment
* Project Structure
* License

---

# 🚀 Overview

CampuSync is a modern leave management platform designed for educational institutions.

It provides:

✅ Student leave applications

✅ Faculty approval workflow

✅ Admin management system

✅ Real-time status tracking

✅ Secure authentication

✅ Responsive dashboards

The goal is to replace traditional paper-based leave systems with a secure digital workflow.

---

# ✨ Features

## 👨‍🎓 Student Module

* Apply for leave requests
* Upload supporting documents
* Track application status
* View leave history
* Responsive dashboard

## 👩‍🏫 Faculty Module

* View pending requests
* Approve / Reject applications
* Add reviewer remarks
* Track review history

## 🛠 Admin Module

* View all requests
* User management
* Analytics dashboard
* System monitoring

## 🔐 Security

* Role Based Access Control
* Protected Routes
* Row Level Security (RLS)
* Secure authentication

## 🎨 UI / UX

* Dark / Light mode
* Mobile responsive
* Modern dashboard
* Interactive tables
* Toast notifications

---

# 📸 Screenshots

## Landing Page

![Landing](./screenshots/landing.png)

---

## Student Dashboard

![Student Dashboard](./screenshots/student-dashboard.png)

---

## Leave Application

![Leave Application](./screenshots/apply-leave.png)

---

## Faculty Dashboard

![Faculty](./screenshots/faculty-dashboard.png)

---

## Admin Dashboard

![Admin](./screenshots/admin-dashboard.png)

---

# 🛠 Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Frontend       | Next.js + TypeScript  |
| Styling        | Tailwind CSS          |
| Backend        | Supabase              |
| Database       | PostgreSQL            |
| Authentication | Supabase Auth         |
| Storage        | Supabase Storage      |
| Forms          | React Hook Form + Zod |
| Tables         | TanStack Table        |
| Deployment     | Vercel                |

---

# 🏗 System Architecture

```text
Students / Faculty / Admin
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

# 🗃 Database Schema

## Profiles Table

```text
id
email
full_name
role
department
avatar_url
created_at
updated_at
```

## Leaves Table

```text
student_id
leave_type
reason
start_date
end_date
status
reviewed_by
reviewer_remark
reviewed_at
attachment_url
```

---

# ⚙ Installation

Clone Repository:

```bash
git clone https://github.com/mark392a-ux/CampuSync.git

cd CampuSync
```

Install dependencies:

```bash
npm install
```

---

# 🔑 Environment Variables

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

---

# ▶ Running Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🚀 Deployment

CampuSync is deployed using:

### Frontend

Vercel

### Backend

Supabase

Build:

```bash
npm run build
```

---

# 📁 Project Structure

```text
campusync/

├── app/
├── components/
├── lib/
├── types/
├── supabase/
├── public/
├── screenshots/
└── README.md
```

---

# 🧪 Test Accounts

Signup normally.

Choose:

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

Contributions are welcome.

Feel free to fork the repository and create pull requests.

---

# 📄 License

MIT License

---

<p align="center">

Built with ❤️ using Next.js + Supabase

</p>
