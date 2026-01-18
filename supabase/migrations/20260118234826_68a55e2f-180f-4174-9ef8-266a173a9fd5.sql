-- Allow admins to modify user_roles table
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create a function to promote a user to admin (for initial setup)
-- This can be called from an edge function with proper authentication
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INTEGER;
BEGIN
  -- Check if there are any admins yet (first admin setup)
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- If no admins exist, allow the first promotion
  -- Otherwise, only existing admins can promote (checked via RLS in calling code)
  IF admin_count = 0 THEN
    -- Update existing role to admin
    UPDATE public.user_roles 
    SET role = 'admin' 
    WHERE user_id = target_user_id;
    
    IF NOT FOUND THEN
      -- Insert new admin role if no role exists
      INSERT INTO public.user_roles (user_id, role) 
      VALUES (target_user_id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
    
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;