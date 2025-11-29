-- Create enrollments table for tracking course enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',
  UNIQUE(user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert enrollments (for checkout process)
CREATE POLICY "Service role can insert enrollments" ON enrollments
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own enrollments (for status changes)
CREATE POLICY "Users can update own enrollments" ON enrollments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
