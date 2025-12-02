-- Upgrade enrollments table with future-proof columns
-- Run this AFTER fix-enrollments-rls.sql

-- Add status column if it doesn't exist (default 'active')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'enrollments' AND column_name = 'status'
  ) THEN
    ALTER TABLE enrollments ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
END $$;

-- Add expires_at column for trials and time-limited access
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add payment_id to link enrollment to specific payment
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;

-- Add purchased_by for gift/team purchases (different from user_id)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS purchased_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add completed_at to track course completion
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Add progress percentage (0-100)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100);

-- Add certificate_issued flag
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS certificate_issued BOOLEAN DEFAULT false;

-- Add notes for admin use (refund reason, special access, etc.)
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add last_accessed_at to track engagement
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Create index on expires_at for finding expiring enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_expires_at ON enrollments(expires_at) WHERE expires_at IS NOT NULL;

-- Create index on payment_id for linking to payments
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_id ON enrollments(payment_id);

-- Add constraint to ensure valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'enrollments_status_check'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (status IN ('active', 'trial', 'expired', 'refunded', 'suspended', 'completed'));
  END IF;
END $$;

-- Update existing enrollments to have 'active' status
UPDATE enrollments SET status = 'active' WHERE status IS NULL;

-- Create a function to check if enrollment is still valid
CREATE OR REPLACE FUNCTION is_enrollment_valid(enrollment_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  enrollment_record RECORD;
BEGIN
  SELECT status, expires_at INTO enrollment_record
  FROM enrollments
  WHERE id = enrollment_id;

  -- Check if status is active/trial/completed
  IF enrollment_record.status NOT IN ('active', 'trial', 'completed') THEN
    RETURN false;
  END IF;

  -- Check if expired
  IF enrollment_record.expires_at IS NOT NULL
     AND enrollment_record.expires_at < NOW() THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create a function to auto-expire enrollments (run this periodically via cron)
CREATE OR REPLACE FUNCTION expire_old_enrollments()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE enrollments
  SET status = 'expired'
  WHERE expires_at IS NOT NULL
    AND expires_at < NOW()
    AND status IN ('active', 'trial')
  RETURNING COUNT(*) INTO expired_count;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN enrollments.status IS 'Enrollment status: active, trial, expired, refunded, suspended, completed';
COMMENT ON COLUMN enrollments.expires_at IS 'When the enrollment expires (NULL = lifetime access)';
COMMENT ON COLUMN enrollments.payment_id IS 'Link to the payment that created this enrollment';
COMMENT ON COLUMN enrollments.purchased_by IS 'Who purchased this enrollment (for gifts/team accounts)';
COMMENT ON COLUMN enrollments.progress IS 'Course completion percentage (0-100)';
COMMENT ON COLUMN enrollments.completed_at IS 'When the user completed the course';
COMMENT ON COLUMN enrollments.certificate_issued IS 'Whether a completion certificate was issued';
COMMENT ON COLUMN enrollments.last_accessed_at IS 'Last time user accessed this course';
