-- ============================================================
-- CampuSync RESET SCRIPT
-- Run this FIRST if you've already run any previous schema.
-- Then run 001_initial_schema.sql
-- ============================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created      ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_leaves_updated_at   ON leaves;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user()           CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column()  CASCADE;

-- Drop tables (CASCADE drops all dependent policies, indexes, etc.)
DROP TABLE IF EXISTS leaves   CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop enums
DROP TYPE IF EXISTS leave_status CASCADE;
DROP TYPE IF EXISTS leave_type   CASCADE;
DROP TYPE IF EXISTS user_role    CASCADE;

-- Drop storage policies (ignore errors if bucket doesn't exist)
DROP POLICY IF EXISTS "storage: auth upload"  ON storage.objects;
DROP POLICY IF EXISTS "storage: auth view"    ON storage.objects;
DROP POLICY IF EXISTS "storage: owner delete" ON storage.objects;

SELECT 'Reset complete. Now run 001_initial_schema.sql' AS status;
