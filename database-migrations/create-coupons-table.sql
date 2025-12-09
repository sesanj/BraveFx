-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  times_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(active);

-- Create coupon_redemptions table to track usage
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES public.enrollments(id) ON DELETE SET NULL,
  amount_saved NUMERIC NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for redemptions
CREATE INDEX IF NOT EXISTS idx_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_enrollment ON public.coupon_redemptions(enrollment_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coupons
-- Anyone can read active coupons (needed for checkout validation)
CREATE POLICY "Anyone can read active coupons"
  ON public.coupons
  FOR SELECT
  USING (active = true);

-- Only authenticated users can view redemptions (their own)
CREATE POLICY "Users can view their own redemptions"
  ON public.coupon_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can do everything (for Edge Functions)
CREATE POLICY "Service role can manage coupons"
  ON public.coupons
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage redemptions"
  ON public.coupon_redemptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.coupons
  SET times_used = times_used + 1
  WHERE id = coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some example coupons for testing
INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
VALUES
  ('LAUNCH50', 'percentage', 50, true, now() + interval '30 days', 100),
  ('EARLYBIRD', 'percentage', 30, true, now() + interval '7 days', 50),
  ('WELCOME10', 'fixed', 10, true, NULL, NULL),
  ('EXPIRED', 'percentage', 20, true, now() - interval '1 day', 100),
  ('INACTIVE', 'percentage', 25, false, NULL, NULL)
ON CONFLICT (code) DO NOTHING;
