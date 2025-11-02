-- Create permissions enum
CREATE TYPE public.app_permission AS ENUM (
  'add_dispute',
  'delete_dispute',
  'upload_excel_litigation',
  'add_users',
  'delete_users',
  'export_reports'
);

-- Create user_permissions table
CREATE TABLE public.user_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission app_permission NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, permission)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check permissions
CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission app_permission)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission = _permission
  )
$$;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_permissions
    WHERE user_id = _user_id
      AND permission IN ('add_users', 'delete_users')
  )
$$;

-- RLS Policies for user_permissions
CREATE POLICY "Users can view their own permissions"
ON public.user_permissions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all permissions"
ON public.user_permissions
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert permissions"
ON public.user_permissions
FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete permissions"
ON public.user_permissions
FOR DELETE
USING (public.is_admin(auth.uid()));

-- Grant all permissions to the default admin user (sadakpramodh_maduru@welspun.com)
-- This will be executed after the user logs in for the first time
-- We'll handle this in the application code

-- Update disputes RLS policies to check permissions
DROP POLICY IF EXISTS "Users can insert their own disputes" ON public.disputes;
DROP POLICY IF EXISTS "Users can delete their own disputes" ON public.disputes;

CREATE POLICY "Users with add_dispute permission can insert disputes"
ON public.disputes
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.has_permission(auth.uid(), 'add_dispute')
);

CREATE POLICY "Users with delete_dispute permission can delete disputes"
ON public.disputes
FOR DELETE
USING (
  auth.uid() = user_id AND 
  public.has_permission(auth.uid(), 'delete_dispute')
);

-- Update litigation_cases RLS policies
DROP POLICY IF EXISTS "Users can create their own litigation cases" ON public.litigation_cases;
DROP POLICY IF EXISTS "Users can delete their own litigation cases" ON public.litigation_cases;

CREATE POLICY "Users with upload_excel permission can insert litigation cases"
ON public.litigation_cases
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND 
  public.has_permission(auth.uid(), 'upload_excel_litigation')
);

CREATE POLICY "Users with delete permission can delete litigation cases"
ON public.litigation_cases
FOR DELETE
USING (
  auth.uid() = user_id AND 
  public.has_permission(auth.uid(), 'delete_dispute')
);