-- Test Campaign Banner
-- Use this to quickly test the campaign banner on your home page

-- Step 1: Create a test campaign (expires in 2 days)
INSERT INTO coupons (
  code,
  discount_type,
  discount_value,
  active,
  is_default,
  expires_at,
  max_uses
)
VALUES (
  'TESTCAMPAIGN50',
  'percentage',
  50,
  true,
  true, -- This makes it a site-wide campaign
  NOW() + INTERVAL '2 days', -- Expires in 2 days
  NULL -- Unlimited uses
)
ON CONFLICT (code) DO UPDATE
SET
  active = true,
  is_default = true,
  expires_at = NOW() + INTERVAL '2 days';

-- Verify the campaign was created
SELECT
  code,
  discount_type,
  discount_value,
  is_default,
  active,
  expires_at,
  created_at
FROM coupons
WHERE code = 'TESTCAMPAIGN50';

-- Expected result on home page:
-- ✅ Beautiful banner appears under hero section
-- ✅ Shows "50% OFF Everything"
-- ✅ Countdown timer shows ~2 days
-- ✅ "Claim Discount" button scrolls to pricing

-- To disable the test campaign:
-- UPDATE coupons SET is_default = FALSE WHERE code = 'TESTCAMPAIGN50';
