-- Fix profiles RLS to allow public viewing of basic profile info for reviews
-- This allows the reviews foreign key join to work properly
-- Run this in Supabase SQL Editor

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create new policy that allows anyone to view basic profile info (needed for reviews)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Keep the update policy restricted to own profile
-- (This should already exist from the schema, but adding it here for completeness)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
