import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4201',
  'https://bravefx.io',
  'https://www.bravefx.io',
];

serve(async (req) => {
  // Get the origin from the request
  const origin = req.headers.get('origin') || '';

  // Check if origin is allowed
  const isAllowed = allowedOrigins.includes(origin);

  // Set CORS headers with the requesting origin if allowed, otherwise deny
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://bravefx.io',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseId, couponCode } = await req.json();

    // Validate required fields
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // 1. Fetch actual course price from database (NEVER trust frontend)
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, price, title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      throw new Error('Course not found');
    }

    // Start with the actual course price from database
    let finalAmount = Math.round(course.price * 100); // Convert dollars to cents
    let discountAmount = 0;
    let appliedCoupon = null;

    // 2. Validate and apply coupon if provided
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (coupon && !couponError) {
        const now = new Date();
        const expiresAt = coupon.expires_at
          ? new Date(coupon.expires_at)
          : null;

        // Check if coupon is valid and not expired
        if (!expiresAt || expiresAt > now) {
          // Check usage limit
          const { count } = await supabase
            .from('coupon_redemptions')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id);

          const usageCount = count || 0;

          if (!coupon.max_uses || usageCount < coupon.max_uses) {
            // Apply discount
            if (coupon.discount_type === 'percentage') {
              // Calculate discount: (price * percentage / 100)
              const discountInDollars =
                (course.price * coupon.discount_value) / 100;
              discountAmount = Math.round(discountInDollars * 100); // Convert to cents
            } else {
              // Fixed amount discount in dollars, convert to cents
              discountAmount = Math.min(
                Math.round(coupon.discount_value * 100),
                finalAmount
              );
            }

            // Subtract discount from final amount
            finalAmount = Math.max(0, finalAmount - discountAmount);
            appliedCoupon = coupon;
          } else {
          }
        } else {
        }
      } else {
      }
    }

    // 3. Validate final amount (must be at least $0.50 for Stripe)
    if (finalAmount < 50) {
      throw new Error('Invalid amount. Minimum $0.50 required.');
    }

    // 4. Create Stripe Payment Intent with verified amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount, // Amount in cents (verified from database)
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'BraveFx_Checkout',
        courseId: course.id,
        courseName: course.title,
        originalPrice: (course.price * 100).toString(),
        discountAmount: discountAmount.toString(),
        couponCode: appliedCoupon?.code || 'none',
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        // Return verified pricing for display confirmation
        verifiedAmount: finalAmount,
        couponApplied: !!appliedCoupon,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
