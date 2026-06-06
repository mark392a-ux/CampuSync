# CampuSync — Campus Leave Management System

> **Live Demo:** [campu-sync.vercel.app](https://campu-sync.vercel.app)  
> **Role-based campus leave management system built with Next.js 14, Supabase & TypeScript.**

---

## 📸 Screenshots

### Login Page
![Login](screenshots/login.png)

### Student Dashboard
![Student Dashboard](screenshots/student-dashboard.png)

### Apply for Leave
![Apply for Leave](screenshots/apply-leave.png)

### Faculty / Admin — Review Requests
![Faculty Review](screenshots/faculty-review.png)

### Admin Analytics Dashboard
![Analytics](screenshots/analytics.png)

---

## 📌 Project Overview

**CampuSync** is a full-stack web application that digitizes and streamlines the campus leave request process. It eliminates paperwork by providing students, faculty, and administrators with dedicated role-based dashboards — from applying for leave to reviewing and tracking requests, all in one place.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔐 Role-Based Auth | Separate dashboards for Student, Faculty, and Admin roles via Supabase Auth |
| 📋 Leave Applications | Students can apply with leave type, date range, reason, and file attachments |
| ✅ Approval Workflow | Faculty/Admin can approve or reject with written remarks |
| 📊 Analytics Dashboard | Visual breakdown of leave trends, status counts, and department-wise data |
| 🌙 Dark / Light Mode | System-aware theme toggle for comfortable use |
| 📱 Responsive Design | Fully mobile-friendly, works across all screen sizes |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3, Radix UI |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Form Handling | React Hook Form + Zod |
| Data Tables | TanStack Table |
| Notifications | Sonner |
| Utilities | date-fns, Lucide Icons |
| Deployment | Vercel |

---

## 🗃️ Database Schema

### `profiles` table
Stores user information linked to Supabase Auth.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key, foreign key → `auth.users` |
| `email` | Text | User email address |
| `full_name` | Text | Display name |
| `role` | Enum | `student`, `faculty`, or `admin` |
| `department` | Text | Department name |
| `avatar_url` | Text | Profile picture URL |

### `leaves` table
Stores all leave requests and their review status.

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `student_id` | UUID | Foreign key → `profiles.id` |
| `leave_type` | Enum | `sick`, `personal`, `medical`, or `other` |
| `start_date` | Date | Leave start date |
| `end_date` | Date | Leave end date |
| `reason` | Text | Reason provided by student |
| `attachment_url` | Text | Optional supporting document URL |
| `status` | Enum | `pending`, `approved`, or `rejected` |
| `reviewed_by` | UUID | Foreign key → `profiles.id` (reviewer) |
| `reviewer_remark` | Text | Remark added during review |
| `reviewed_at` | Timestamp | Time of review |

> **Row Level Security (RLS):** Students can only view and manage their own records. Faculty and Admin have full read access across all records.

---

## 📁 Project Structure

```
campusync/
├── app/
│   ├── (auth)/
│   │   ├── login/                  # Login page
│   │   └── signup/                 # Signup page with role selection
│   ├── (dashboard)/
│   │   ├── student/                # Student: dashboard, apply, my applications
│   │   ├── faculty/                # Faculty: dashboard, pending requests, history
│   │   └── admin/                  # Admin: dashboard, all requests, analytics, users
│   └── auth/callback/              # Supabase OAuth callback handler
├── components/
│   ├── ui/                         # Reusable UI: Button, Card, Input, Dialog, etc.
│   ├── dashboard/                  # Sidebar, StatsCard, StatusBadge
│   ├── forms/                      # LeaveApplicationForm, ReviewLeaveDialog
│   └── tables/                     # LeavesTable built with TanStack Table
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase browser client
│   │   └── server.ts               # Supabase server client (RSC-compatible)
│   ├── utils.ts                    # Shared utility functions
│   └── validations.ts              # Zod schemas for form validation
├── types/
│   └── index.ts                    # Shared TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Full DB schema with RLS policies
├── middleware.ts                   # Route protection by role
└── .env.example                    # Environment variable template
```

---

## ⚙️ Local Setup Guide

Follow these steps carefully to run the project on your machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) v18 or higher
- npm v9 or higher
- A free [Supabase](https://supabase.com) account

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/mark392a-ux/campusync.git
cd campusync
```

---

### Step 2 — Install Dependencies

```bash
npm install
```

---

### Step 3 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once the project is ready, open the **SQL Editor** from the left sidebar.
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` and paste it into the editor.
4. Click **Run** to create all tables, enums, and RLS policies.
5. Go to **Project Settings → API** and note down:
   - **Project URL**
   - **anon / public key**
   - **service_role key** *(keep this secret)*

---

### Step 4 — Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

### Step 5 — Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Test Accounts

You can sign up directly at `/signup` and choose your role during registration.

| Role | Access |
|---|---|
| **Student** | Apply for leave, view own application history |
| **Faculty** | Review student leave requests, add remarks |
| **Admin** | All faculty access + analytics dashboard + user management |

> **For production deployments**, disable role selection on the signup form and assign roles directly via SQL:
> ```sql
> UPDATE profiles SET role = 'admin'   WHERE email = 'admin@yourdomain.com';
> UPDATE profiles SET role = 'faculty' WHERE email = 'faculty@yourdomain.com';
> ```

---

## 🚀 Deployment

This project is deployed on **Vercel**. To deploy your own instance:

**Option A — One-click deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mark392a-ux/campusync)

**Option B — Manual deploy via CLI:**

```bash
npm install -g vercel
vercel
```

After deploying, go to your Vercel project dashboard → **Settings → Environment Variables** and add the three variables from Step 4.

---

## 🔒 Security Notes

- All database access is protected by **Supabase Row Level Security (RLS)**.
- The `SUPABASE_SERVICE_ROLE_KEY` is only used server-side and is never exposed to the browser.
- File attachments are stored in **Supabase Storage** with access scoped per user.
- Route protection is handled by `middleware.ts` — unauthenticated users are redirected to `/login`.

---

## 📄 License

MIT License © 2024 [Ankit](https://github.com/mark392a-ux)

---

*Built with Next.js 14, Supabase, TypeScript, and Tailwind CSS.*
