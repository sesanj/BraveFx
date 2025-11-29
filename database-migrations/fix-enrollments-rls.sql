-- Fix enrollments RLS to allow authenticated users to enroll themselves
-- This allows the checkout process to work properly

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Service role can insert enrollments" ON enrollments;

-- Create new policy: Allow authenticated users to insert their own enrollments
CREATE POLICY "Users can enroll themselves" ON enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also allow service role (for admin operations)
CREATE POLICY "Service role can manage enrollments" ON enrollments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
