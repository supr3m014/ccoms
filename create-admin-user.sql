-- Create Admin User Script
-- Run this in Supabase SQL Editor to create the admin user
--
-- Email: admin@ccoms.ph
-- Password: CoreConversion2024!
--
-- Note: This uses Supabase Auth API, so you should run this via
-- the create-admin edge function or create the user manually in the dashboard.
--
-- To create manually:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User"
-- 3. Enter the email and password above
-- 4. Make sure "Auto Confirm User" is checked
-- 5. Click "Create User"
--
-- Alternatively, call the edge function:
-- curl -X POST https://your-project.supabase.co/functions/v1/create-admin \
--   -H "Authorization: Bearer YOUR_ANON_KEY"

-- Check if admin user already exists
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'admin@ccoms.ph';
