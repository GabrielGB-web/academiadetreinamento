-- Allow admins to view all profiles (for user management)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to view all user roles
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can view their own role or admins can view all"
ON public.user_roles FOR SELECT
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);