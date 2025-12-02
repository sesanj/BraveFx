-- Fix enrollments table: Change course_id from INTEGER to UUID
-- This is necessary because courses.id is UUID, not INTEGER

-- Step 1: Drop the old index
DROP INDEX IF EXISTS idx_enrollments_course_id;

-- Step 2: Delete any existing enrollment data (test data only)
-- IMPORTANT: Only run this in development! In production, you'd need data migration
DELETE FROM enrollments;

-- Step 3: Drop and recreate the course_id column with correct type
ALTER TABLE enrollments DROP COLUMN IF EXISTS course_id;
ALTER TABLE enrollments ADD COLUMN course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE;

-- Step 4: Recreate the index
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- Step 5: Update the unique constraint to use the new UUID type
ALTER TABLE enrollments DROP CONSTRAINT IF EXISTS enrollments_user_id_course_id_key;
ALTER TABLE enrollments ADD CONSTRAINT enrollments_user_id_course_id_key UNIQUE(user_id, course_id);

-- Done! Now enrollments.course_id is UUID and matches courses.id
