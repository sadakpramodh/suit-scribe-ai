-- Add approved column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN approved boolean NOT NULL DEFAULT false;

-- Create a function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_user_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT approved FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- Update RLS policies to check approval status
-- Users must be approved to access their own data

-- Drop existing policies on disputes
DROP POLICY IF EXISTS "Users can view their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can update their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users with add_dispute permission can insert disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users with delete_dispute permission can delete disputes" ON public.disputes;

-- Create new policies with approval check
CREATE POLICY "Approved users can view their own disputes"
ON public.disputes
FOR SELECT
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update their own disputes"
ON public.disputes
FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users with permission can insert disputes"
ON public.disputes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.is_user_approved(auth.uid())
  AND public.has_permission(auth.uid(), 'add_dispute'::app_permission)
);

CREATE POLICY "Approved users with permission can delete disputes"
ON public.disputes
FOR DELETE
USING (
  auth.uid() = user_id 
  AND public.is_user_approved(auth.uid())
  AND public.has_permission(auth.uid(), 'delete_dispute'::app_permission)
);

-- Update litigation_cases policies
DROP POLICY IF EXISTS "Users can view their own litigation cases" ON public.litigation_cases;
DROP POLICY IF EXISTS "Users can update their own litigation cases" ON public.litigation_cases;
DROP POLICY IF EXISTS "Users with upload_excel permission can insert litigation cases" ON public.litigation_cases;
DROP POLICY IF EXISTS "Users with delete permission can delete litigation cases" ON public.litigation_cases;

CREATE POLICY "Approved users can view their own litigation cases"
ON public.litigation_cases
FOR SELECT
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update their own litigation cases"
ON public.litigation_cases
FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users with permission can insert litigation cases"
ON public.litigation_cases
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.is_user_approved(auth.uid())
  AND public.has_permission(auth.uid(), 'upload_excel_litigation'::app_permission)
);

CREATE POLICY "Approved users with permission can delete litigation cases"
ON public.litigation_cases
FOR DELETE
USING (
  auth.uid() = user_id 
  AND public.is_user_approved(auth.uid())
  AND public.has_permission(auth.uid(), 'delete_dispute'::app_permission)
);

-- Update alert_settings policies
DROP POLICY IF EXISTS "Users can view own alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Users can insert own alert settings" ON public.alert_settings;
DROP POLICY IF EXISTS "Users can update own alert settings" ON public.alert_settings;

CREATE POLICY "Approved users can view own alert settings"
ON public.alert_settings
FOR SELECT
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can insert own alert settings"
ON public.alert_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

CREATE POLICY "Approved users can update own alert settings"
ON public.alert_settings
FOR UPDATE
USING (auth.uid() = user_id AND public.is_user_approved(auth.uid()));

COMMENT ON COLUMN public.profiles.approved IS 'Whether the user has been approved by an admin to access the application';