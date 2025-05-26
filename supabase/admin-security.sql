-- Create a function to ensure only one super admin exists
CREATE OR REPLACE FUNCTION ensure_single_admin()
RETURNS TRIGGER AS $$
DECLARE
  super_admin_email TEXT := 'your-email@example.com'; -- Replace with your email
  current_user_email TEXT;
BEGIN
  -- Get the current user's email
  SELECT email INTO current_user_email 
  FROM auth.users 
  WHERE id = auth.uid();

  -- If someone is trying to set role to admin
  IF NEW.role = 'admin' THEN
    -- Only allow if it's the super admin's email
    IF NEW.email != super_admin_email THEN
      RAISE EXCEPTION 'Only the super admin can have admin role';
    END IF;
    
    -- Only the super admin can promote to admin
    IF current_user_email != super_admin_email THEN
      RAISE EXCEPTION 'Only the super admin can promote users to admin';
    END IF;
  END IF;

  -- Prevent demoting the super admin
  IF OLD.email = super_admin_email AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Cannot demote the super admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce admin security
DROP TRIGGER IF EXISTS enforce_admin_security ON public.users;
CREATE TRIGGER enforce_admin_security
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_admin();

-- Create a function to automatically set super admin role
CREATE OR REPLACE FUNCTION set_super_admin()
RETURNS VOID AS $$
DECLARE
  super_admin_email TEXT := 'your-email@example.com'; -- Replace with your email
BEGIN
  -- Ensure the super admin has admin role
  UPDATE public.users 
  SET role = 'admin' 
  WHERE email = super_admin_email;
  
  -- Demote any other admins
  UPDATE public.users 
  SET role = 'editor' 
  WHERE role = 'admin' AND email != super_admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to set initial state
SELECT set_super_admin();
