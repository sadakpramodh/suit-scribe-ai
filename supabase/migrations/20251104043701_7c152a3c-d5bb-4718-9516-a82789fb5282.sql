-- Update the handle_new_user function to auto-approve admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile with auto-approval for admin email
  INSERT INTO public.profiles (id, full_name, approved)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN NEW.email = 'sadakpramodh_maduru@welspun.com' THEN true
      ELSE false
    END
  );
  
  -- Insert default role as 'user'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Insert default alert settings
  INSERT INTO public.alert_settings (user_id)
  VALUES (NEW.id);
  
  -- Auto-grant all permissions if admin email
  IF NEW.email = 'sadakpramodh_maduru@welspun.com' THEN
    INSERT INTO public.user_permissions (user_id, permission, granted_by)
    VALUES 
      (NEW.id, 'add_dispute', NEW.id),
      (NEW.id, 'delete_dispute', NEW.id),
      (NEW.id, 'upload_excel_litigation', NEW.id),
      (NEW.id, 'add_users', NEW.id),
      (NEW.id, 'delete_users', NEW.id),
      (NEW.id, 'export_reports', NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;