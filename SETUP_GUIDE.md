# ⚡ Supabase Setup Guide — Fix Auth Issues

Follow these steps **in order** to get CampuSync working properly.

---

## Step 1 — Run the Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **+ New query**
4. Paste the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** ▶️

> **Already ran the old schema?** Run this first to reset:
> ```sql
> DROP TABLE IF EXISTS leaves CASCADE;
> DROP TABLE IF EXISTS profiles CASCADE;
> DROP TYPE IF EXISTS user_role CASCADE;
> DROP TYPE IF EXISTS leave_type CASCADE;
> DROP TYPE IF EXISTS leave_status CASCADE;
> DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
> DROP FUNCTION IF EXISTS handle_new_user();
> DROP FUNCTION IF EXISTS update_updated_at_column();
> ```
> Then re-run the migration SQL.

---

## Step 2 — CRITICAL: Disable Email Confirmation

This is why you get **"Invalid credentials"** — Supabase requires email confirmation by default, but in development you want to skip it.

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Click on **Email** provider
3. **Turn OFF** "Confirm email" toggle
4. Click **Save**

![Turn off email confirmation](https://i.imgur.com/placeholder.png)

After disabling, newly created accounts can log in immediately without checking email.

---

## Step 3 — Verify Environment Variables

Make sure your `.env.local` has the correct values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pscwsuiqrlciyyhnwjjj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6InNlcnZpY2Vfcm9sZSIsImlhdCI6...
```

- The **SUPABASE_SERVICE_ROLE_KEY** is critical — it allows the app to create user profiles bypassing RLS
- Find these in: Supabase Dashboard → **Project Settings** → **API**

---

## Step 4 — Test Sign-Up Flow

1. Go to `http://localhost:3000/signup`
2. Fill in name, email, password (min 8 chars, 1 uppercase, 1 number e.g. `Test@1234`)
3. Select a role (Student / Faculty / Admin)
4. Click **Create account**

You should be automatically redirected to the dashboard.

---

## Step 5 — Verify Profile Was Created

1. In Supabase, go to **Table Editor** → `profiles`
2. You should see a row with your email and selected role

If no row exists:
- Check **Authentication** → **Users** — did the auth user get created?
- Check **SQL Editor** → run `SELECT * FROM profiles;`
- If empty but auth user exists, the trigger may have failed — the app's server action will create the profile as a fallback

---

## Common Issues & Fixes

### ❌ "Invalid credentials" on login
**Cause:** Email confirmation is enabled OR wrong password  
**Fix:** Disable email confirmation (Step 2 above)

### ❌ "Unable to save entry in database" on signup
**Cause:** RLS policy blocking the trigger insert  
**Fix:** The updated schema uses `SECURITY DEFINER` on the trigger, which bypasses RLS. Re-run the migration SQL.

### ❌ Profile not created after signup
**Cause:** Trigger didn't fire (can happen if schema wasn't applied correctly)  
**Fix:** The signup page now calls a Server Action using the service role key as a fallback — make sure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`

### ❌ "middleware deprecated" warning
**Fix:** Already fixed — the app now uses `proxy.ts` instead of `middleware.ts` (Next.js 16 requirement)

### ❌ Cannot apply unknown utility class (Tailwind CSS error)
**Fix:** Already fixed — the project uses Tailwind CSS v3 with the correct PostCSS config

---

## Manually Setting Roles (Optional)

If you want to change a user's role after signup, run in SQL Editor:

```sql
-- Make someone an admin
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Make someone faculty
UPDATE profiles SET role = 'faculty' WHERE email = 'your@email.com';
```

---

## Reset Everything (Nuclear Option)

If something is badly broken, delete all users and start fresh:

```sql
-- In SQL Editor:
DELETE FROM leaves;
DELETE FROM profiles;
-- Then delete users from Authentication → Users in the dashboard
-- Then re-sign-up
```
