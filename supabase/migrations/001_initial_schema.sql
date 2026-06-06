-- ============================================================
-- CampuSync — Initial Schema v3
-- Run AFTER 000_reset.sql if migrating from a previous version
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Enums ────────────────────────────────────────────────────
CREATE TYPE user_role    AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE leave_type   AS ENUM ('sick', 'personal', 'medical', 'other');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');

-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL UNIQUE,
  full_name   TEXT        NOT NULL,
  role        user_role   NOT NULL DEFAULT 'student',
  department  TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leaves (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID         NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  leave_type      leave_type   NOT NULL,
  start_date      DATE         NOT NULL,
  end_date        DATE         NOT NULL,
  reason          TEXT         NOT NULL,
  attachment_url  TEXT,
  status          leave_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_remark TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX idx_leaves_student_id ON leaves(student_id);
CREATE INDEX idx_leaves_status     ON leaves(status);
CREATE INDEX idx_leaves_created_at ON leaves(created_at DESC);
CREATE INDEX idx_profiles_role     ON profiles(role);

-- ── updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at
  BEFORE UPDATE ON leaves
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Auto-create profile on signup ────────────────────────────
-- SECURITY DEFINER = runs as postgres superuser, bypasses RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves   ENABLE ROW LEVEL SECURITY;

-- profiles: self read
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- profiles: faculty/admin read all
CREATE POLICY "profiles_staff_read" ON profiles
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('faculty','admin')
  );

-- profiles: self update
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- profiles: self insert (fallback if trigger missed)
CREATE POLICY "profiles_self_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- leaves: student reads own
CREATE POLICY "leaves_student_read" ON leaves
  FOR SELECT USING (student_id = auth.uid());

-- leaves: faculty/admin reads all
CREATE POLICY "leaves_staff_read" ON leaves
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('faculty','admin')
  );

-- leaves: student inserts own
CREATE POLICY "leaves_student_insert" ON leaves
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'student'
  );

-- leaves: student updates own pending
CREATE POLICY "leaves_student_update" ON leaves
  FOR UPDATE USING (student_id = auth.uid() AND status = 'pending')
  WITH CHECK (student_id = auth.uid());

-- leaves: faculty/admin updates any
CREATE POLICY "leaves_staff_update" ON leaves
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('faculty','admin')
  );

-- leaves: student deletes own pending
CREATE POLICY "leaves_student_delete" ON leaves
  FOR DELETE USING (student_id = auth.uid() AND status = 'pending');

-- ── Storage ──────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('leave-attachments', 'leave-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'leave-attachments' AND auth.role() = 'authenticated'
  );

CREATE POLICY "storage_view" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'leave-attachments' AND auth.role() = 'authenticated'
  );

CREATE POLICY "storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'leave-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

SELECT 'Schema installed successfully!' AS status;
