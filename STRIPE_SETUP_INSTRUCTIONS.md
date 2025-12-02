# Stripe Payment Integration Setup Guide

## ✅ What We've Built

### Frontend (Complete)

- Beautiful 2-step checkout flow (Account Info → Payment)
- Stripe Elements card input with real-time validation
- Form validation for email, password, and name
- Responsive design matching your BraveFx theme
- Success/error handling with smooth animations

### Backend (Needs Setup)

You need to create a Supabase Edge Function to handle Stripe payments securely.

---

## 🚀 Step-by-Step Setup

### Step 1: Get Stripe API Keys

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Go to **Developers → API Keys**
3. Copy your **Publishable Key** (starts with `pk_test_...`)
4. Copy your **Secret Key** (starts with `sk_test_...`)

### Step 2: Add Stripe Keys to Environment

1. Open `src/environments/environment.ts`
2. Replace `pk_test_YOUR_PUBLISHABLE_KEY_HERE` with your actual Stripe publishable key
3. Do the same for `environment.development.ts`

**Example:**

```typescript
stripe: {
  publishableKey: 'pk_test_51KcXxYZ...', // Your actual key
},
```

### Step 3: Install Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project (use your Supabase project URL)
supabase link --project-ref ppbshpbicprzorjcilcn
```

### Step 4: Create Stripe Payment Intent Edge Function

```bash
# Create the edge function
supabase functions new create-payment-intent
```

This creates: `supabase/functions/create-payment-intent/index.ts`

**Replace the contents with:**

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    if (!amount || amount < 50) {
      throw new Error("Invalid amount");
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
```

### Step 5: Set Stripe Secret Key in Supabase

```bash
# Set your Stripe secret key as an environment variable
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### Step 6: Deploy the Edge Function

```bash
# Deploy to Supabase
supabase functions deploy create-payment-intent
```

### Step 7: Test the Function

```bash
# Test locally first
supabase functions serve

# In another terminal, test the function
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": 4999}'
```

---

## 🗃️ Database Setup

### Required Tables

You need these tables in Supabase (some may already exist):

#### 1. **payments** table

```sql
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  payment_intent_id TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert payments
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT
  WITH CHECK (true);
```

#### 2. **enrollments** table

```sql
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert enrollments
CREATE POLICY "Service role can insert enrollments" ON enrollments
  FOR INSERT
  WITH CHECK (true);
```

#### 3. **profiles** table (should already exist)

Make sure it has these columns:

- `id` (UUID, primary key, references auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `role` (TEXT, default 'student')
- `created_at` (TIMESTAMPTZ)

---

## 🧪 Testing the Checkout Flow

### Test Credit Cards (Stripe Test Mode)

| Card Number         | Result                              |
| ------------------- | ----------------------------------- |
| 4242 4242 4242 4242 | Success                             |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Card declined                       |

- **CVV**: Any 3 digits
- **Expiry**: Any future date
- **ZIP**: Any 5 digits

### Testing Steps

1. Run your Angular app: `npm start`
2. Go to `/checkout`
3. Fill in account details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Check "I agree to terms"
5. Click "Continue to Payment"
6. Enter test card: `4242 4242 4242 4242`
7. Click "Pay $49.99"
8. Should redirect to `/student-dashboard`

---

## 🔒 Security Notes

- ✅ Never expose your Stripe **secret key** in frontend code
- ✅ Always use Edge Functions to create payment intents
- ✅ Validate amounts on the server side
- ✅ Enable Row Level Security (RLS) on all tables
- ✅ Use HTTPS in production

---

## 📊 Monitoring Payments

### Stripe Dashboard

- View payments: [https://dashboard.stripe.com/payments](https://dashboard.stripe.com/payments)
- View customers: [https://dashboard.stripe.com/customers](https://dashboard.stripe.com/customers)

### Supabase Dashboard

- Check `payments` table for payment records
- Check `enrollments` table for course enrollments
- Check `profiles` table for new user accounts

---

## 🐛 Troubleshooting

### Error: "Stripe not initialized"

- Check that `environment.ts` has correct publishable key
- Verify Stripe SDK is installed: `npm install @stripe/stripe-js`

### Error: "Failed to create payment intent"

- Check Edge Function is deployed: `supabase functions list`
- Verify secret key is set: `supabase secrets list`
- Check Edge Function logs: `supabase functions logs create-payment-intent`

### Error: "Account creation failed"

- Check database tables exist (`payments`, `enrollments`, `profiles`)
- Verify RLS policies are correct
- Check Supabase logs in dashboard

### Payment succeeds but user not enrolled

- Check `enrollments` table insert policy
- Verify `course_id = 1` exists in your `courses` table
- Check browser console for errors

---

## 🚀 Going to Production

### Before Launch:

1. **Switch to Stripe Live Mode**

   - Get live API keys from Stripe
   - Update `environment.ts` (not `.development.ts`)
   - Redeploy Edge Function with live secret key

2. **Update Environment Files**

   ```typescript
   // environment.ts (production)
   export const environment = {
     production: true,
     stripe: {
       publishableKey: "pk_live_...", // Live key
     },
     coursePrice: 4999,
   };
   ```

3. **Verify Webhooks** (Optional but recommended)

   - Set up Stripe webhook endpoint
   - Listen for `payment_intent.succeeded` events
   - Update payment status in database

4. **Enable Email Confirmations**
   - Configure Supabase email settings
   - Customize email templates
   - Test registration flow

---

## 💡 Next Steps

After payment integration works:

1. **Add Paystack** (for Nigerian users)

   - Similar flow to Stripe
   - Create separate Edge Function
   - Add payment method selector

2. **Add Invoice Generation**

   - Create PDF invoices
   - Email to customers after purchase
   - Store in Supabase Storage

3. **Add Refund System**

   - Admin dashboard refund button
   - Stripe refund API integration
   - Update enrollment status

4. **Add Discount Codes**
   - Coupon codes table
   - Apply discounts at checkout
   - Track coupon usage

---

## 📞 Support

If you encounter issues:

- Check Supabase logs: `supabase functions logs create-payment-intent`
- Check Stripe logs: [https://dashboard.stripe.com/logs](https://dashboard.stripe.com/logs)
- Verify environment variables are set correctly
- Test with Stripe test cards first

---

**You're all set!** 🎉 Once you complete these steps, your checkout flow will be fully functional.
