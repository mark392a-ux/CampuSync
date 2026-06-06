# 🎓 CampuSync — Campus Leave Management System

A modern, production-ready campus leave management system built with Next.js 14, Supabase, TypeScript, and Tailwind CSS.

## ✨ Features

- 🔐 Role-based auth — Student, Faculty, Admin via Supabase Auth
- 📋 Leave applications with file attachments (Supabase Storage)
- ✅ Approve/reject workflow with reviewer remarks
- 📊 Analytics dashboard with charts and breakdowns
- 🌙 Dark/light mode toggle
- 📱 Fully responsive mobile-first design

## 🛠 Tech Stack

Next.js 14 · TypeScript · Tailwind CSS v3 · Radix UI · Supabase · React Hook Form · Zod · TanStack Table · Sonner · date-fns · Lucide Icons

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Go to https://supabase.com → Create new project
2. Open **SQL Editor** → paste contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Project Settings → API** and copy your keys

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run dev server

```bash
npm run dev
```

Open http://localhost:3000

---

## 👤 Test Accounts

Sign up at `/signup` — you can select any role (Student/Faculty/Admin).

For production, restrict Admin/Faculty assignment to the database only:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'admin@example.com';
UPDATE profiles SET role = 'faculty' WHERE email = 'faculty@example.com';
```

---

## 📁 Project Structure

```
campusync/
├── app/
│   ├── (auth)/login|signup     # Auth pages
│   ├── (dashboard)/
│   │   ├── student/            # Student: dashboard, apply, applications
│   │   ├── faculty/            # Faculty: dashboard, requests, history
│   │   └── admin/              # Admin: dashboard, requests, analytics, users
│   └── auth/callback/          # Supabase OAuth callback
├── components/
│   ├── ui/                     # Button, Card, Input, Dialog, etc.
│   ├── dashboard/              # Sidebar, StatsCard, StatusBadge
│   ├── forms/                  # LeaveApplicationForm, ReviewLeaveDialog
│   └── tables/                 # LeavesTable (TanStack)
├── lib/
│   ├── supabase/client.ts      # Browser client
│   ├── supabase/server.ts      # Server client
│   ├── utils.ts                # Helpers
│   └── validations.ts          # Zod schemas
├── types/index.ts
├── supabase/migrations/001_initial_schema.sql
└── middleware.ts               # Route protection
```

---

## 🗃️ Database Schema

**profiles**: id (FK auth.users), email, full_name, role (student|faculty|admin), department, avatar_url

**leaves**: id, student_id (FK), leave_type (sick|personal|medical|other), start_date, end_date, reason, attachment_url, status (pending|approved|rejected), reviewed_by, reviewer_remark, reviewed_at

RLS policies ensure students see only their own data; faculty/admin see all.

---

## 🚀 Deploy to Vercel

```bash
vercel
# Add env vars in Vercel dashboard
```

Built with ❤️ for modern campuses. MIT License.
