-- Fix promote_to_admin to properly update existing user role
CREATE OR REPLACE FUNCTION public.promote_to_admin(target_user_id uuid)
RETURNS boolean
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