import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

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
    const { amount } = await req.json();

    // Validate amount (must be at least $0.50)
    if (!amount || amount < 50) {
      throw new Error('Invalid amount. Minimum $0.50 required.');
    }

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        source: 'BraveFx_Checkout',
      },
    });

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
