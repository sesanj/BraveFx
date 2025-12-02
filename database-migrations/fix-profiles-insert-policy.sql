-- Fix profiles RLS to allow INSERT during signup/checkout
-- This resolves the "new row violates row-level security policy" error
-- Run this in Supabase SQL Editor

-- Add INSERT policy for profiles table
-- This allows new users to create their profile during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Verify all policies are in place:
-- 1. SELECT: Anyone can view profiles (for reviews)
-- 2. UPDATE: Users can update own profile
-- 3. INSERT: Users can insert own profile (NEWLY ADDED)

-- You can verify policies with:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';
