-- SQL Script to promote a user to Admin
-- 1. First, sign up as a regular user in your application.
-- 2. Once you have signed up, go to your Supabase SQL Editor.
-- 3. Run the following command, replacing 'YOUR_USER_EMAIL' with your actual email.

SELECT promote_to_admin(id)
FROM auth.users
WHERE email = 'YOUR_USER_EMAIL';

-- Note: The promote_to_admin function was created during the initial schema setup.
