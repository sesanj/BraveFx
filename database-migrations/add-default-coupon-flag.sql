-- Migration: Add site-wide default coupon support
-- This allows setting one coupon as the default for site-wide campaigns
-- Default coupons override any specific coupon codes from URLs

-- Add is_default column to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Create unique constraint to ensure only one default coupon at a time
-- This prevents having multiple active site-wide campaigns simultaneously
DROP INDEX IF EXISTS idx_single_default_coupon;
CREATE UNIQUE INDEX idx_single_default_coupon
ON coupons (is_default)
WHERE is_default = TRUE;

-- Comment on the column for documentation
COMMENT ON COLUMN coupons.is_default IS
'Site-wide default coupon flag. Only one coupon can have is_default=true at a time.
Default coupons override any specific coupon codes from URLs during campaigns like Black Friday, Launch Week, etc.';

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- Enable a Black Friday site-wide campaign:
-- UPDATE coupons SET is_default = TRUE WHERE code = 'BLACKFRIDAY50';

-- Switch to a Christmas campaign:
-- UPDATE coupons SET is_default = FALSE WHERE code = 'BLACKFRIDAY50';
-- UPDATE coupons SET is_default = TRUE WHERE code = 'XMAS25';

-- Turn OFF all site-wide discounts:
-- UPDATE coupons SET is_default = FALSE;

-- ============================================
-- PRIORITY ORDER
-- ============================================
-- 1. Site-wide campaign (is_default = true) - HIGHEST PRIORITY
-- 2. Specific coupon from URL (?coupon=CODE) - Only if no site-wide campaign
-- 3. No discount - No active campaign
