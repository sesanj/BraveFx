-- Fix RLS policy for coupon_redemptions to allow inserts
-- The issue: Users need to be able to insert their own redemptions after payment

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.coupon_redemptions;
DROP POLICY IF EXISTS "Service role can manage redemptions" ON public.coupon_redemptions;

-- Allow users to view their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own redemptions
CREATE POLICY "Users can insert their own redemptions"
  ON public.coupon_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role can manage redemptions"
  ON public.coupon_redemptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
