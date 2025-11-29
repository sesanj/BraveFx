# 🧠 Edge Functions Explained - Complete Guide

## What Problem Do Edge Functions Solve?

### ❌ The Problem: Secret Keys in Frontend

If you try to use Stripe directly in your Angular app:

```typescript
// 🚨 NEVER DO THIS - Anyone can see this code!
import Stripe from "@stripe/stripe-js";

const stripe = new Stripe("sk_test_ABC123SECRET"); // ❌ Exposed to everyone!
const paymentIntent = await stripe.paymentIntents.create({
  amount: 4999,
  currency: "usd",
});
```

**Why this is dangerous:**

- Anyone can view your frontend code (View Source, DevTools)
- Secret key gives full access to your Stripe account
- Attackers can charge cards, issue refunds, steal customer data
- You'd violate PCI compliance and lose payment processing

### ✅ The Solution: Edge Functions

```typescript
// ✅ Frontend (Safe - only has public key)
const result = await supabase.functions.invoke("create-payment-intent", {
  body: { amount: 4999 },
});
const { clientSecret } = result.data;

// User can't see secret key, it's on server
```

```typescript
// ✅ Edge Function (Server-side - Secret key hidden)
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const paymentIntent = await stripe.paymentIntents.create({
  amount: 4999,
  currency: "usd",
});
return { clientSecret: paymentIntent.client_secret };
```

---

## 🔍 How Our Edge Function Works (Line by Line)

Let's break down `supabase/functions/create-payment-intent/index.ts`:

### Part 1: Imports

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.25.0?target=deno";
```

**What this means:**

- Edge Functions use **Deno** (not Node.js)
- Deno imports from URLs (not npm packages)
- `serve` creates an HTTP server
- `Stripe` is the Stripe SDK for Deno

### Part 2: Initialize Stripe

```typescript
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});
```

**What this means:**

- `Deno.env.get('STRIPE_SECRET_KEY')` reads from Supabase Vault
- This secret is set with: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`
- Secret NEVER appears in code, only in encrypted storage
- `apiVersion` ensures consistent Stripe API behavior

### Part 3: CORS Headers

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**What this means:**

- CORS = Cross-Origin Resource Sharing
- Your Angular app (localhost:4200) needs permission to call this function
- `*` means allow all origins (tighten to your domain in production)
- Without this, browsers block the request

### Part 4: Request Handler

```typescript
serve(async (req) => {
  // Handle OPTIONS request (browser preflight check)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
```

**What this means:**

- `serve` starts an HTTP server
- Browsers send `OPTIONS` request before `POST` (security check)
- We respond with CORS headers to approve the real request

### Part 5: Extract Amount

```typescript
  try {
    const { amount } = await req.json()
```

**What this means:**

- Request body from Angular: `{ amount: 4999 }`
- `req.json()` parses the JSON
- Extract the `amount` field

### Part 6: Validation

```typescript
if (!amount || amount < 50) {
  throw new Error("Invalid amount. Minimum $0.50 required.");
}
```

**What this means:**

- **Security check!** Never trust frontend data
- Ensures amount is present and reasonable
- Stripe requires minimum 50 cents
- Prevents someone from modifying frontend code to pay $0.01

### Part 7: Create Payment Intent

```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // 4999 cents = $49.99
  currency: "usd",
  automatic_payment_methods: {
    enabled: true, // Accept all card types
  },
  metadata: {
    source: "BraveFx_Checkout", // Track where payment came from
  },
});
```

**What this means:**

- Calls Stripe API to create a Payment Intent
- Payment Intent = "intention to pay" (not charged yet)
- Stripe generates a `client_secret` for this intent
- Metadata helps with tracking and analytics

### Part 8: Return Response

```typescript
return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
  headers: { ...corsHeaders, "Content-Type": "application/json" },
  status: 200,
});
```

**What this means:**

- Send `client_secret` back to Angular app
- Angular uses this to confirm payment with card details
- Include CORS headers so browser accepts response

### Part 9: Error Handling

```typescript
  } catch (error) {
    console.error('Error creating payment intent:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

**What this means:**

- If anything fails (invalid amount, Stripe error, etc.)
- Log error to Supabase logs
- Return error message to frontend
- Frontend shows user-friendly error

---

## 🔄 Complete Payment Flow (Detailed)

### Step-by-Step Process:

#### 1️⃣ User Enters Card Details

```
User in checkout page → Enters card in Stripe Elements
```

#### 2️⃣ User Clicks "Pay"

```typescript
// checkout.component.ts
async processPayment() {
  // Step 2a: Call Edge Function
  const paymentIntent = await this.paymentService.createPaymentIntent(4999);
```

#### 3️⃣ Angular Calls Edge Function

```typescript
// payment.service.ts
async createPaymentIntent(amount: number) {
  const { data, error } = await this.supabase.client.functions.invoke(
    'create-payment-intent',
    { body: { amount } }
  );
  return data; // { clientSecret: "pi_xyz..." }
}
```

**What happens here:**

- HTTP POST to: `https://ppbshpbicprzorjcilcn.supabase.co/functions/v1/create-payment-intent`
- Body: `{ amount: 4999 }`
- Headers include your Supabase anon key for authentication

#### 4️⃣ Edge Function Processes Request

```typescript
// Edge Function receives: { amount: 4999 }
// Validates amount
// Calls Stripe API with SECRET key
// Returns: { clientSecret: "pi_3ABC123..." }
```

#### 5️⃣ Angular Confirms Payment

```typescript
// payment.service.ts
const result = await this.stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: this.cardElement, // Card details from Stripe Elements
    billing_details: { name, email },
  },
});
```

**What happens here:**

- Stripe Elements securely sends card data to Stripe (not your server!)
- Stripe charges the card
- Returns success/failure

#### 6️⃣ Create User Account

```typescript
// payment.service.ts
await this.createUserAndEnroll(email, password, fullName, paymentIntentId);
// Creates:
// - auth.users record
// - profiles record
// - payments record
// - enrollments record
```

#### 7️⃣ Redirect to Dashboard

```typescript
await this.authService.signIn(email, password);
this.router.navigate(["/student-dashboard"]);
```

---

## 🗺️ Visual Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────┐         ┌─────────────────┐                 │
│  │ Checkout Page  │────────▶│ Stripe Elements │                 │
│  │  (Angular)     │         │  (Card Input)   │                 │
│  └────────────────┘         └─────────────────┘                 │
│         │                            │                           │
│         │ 1. Call Edge Function      │ 2. Send Card to Stripe   │
│         ▼                            ▼                           │
└─────────┼────────────────────────────┼───────────────────────────┘
          │                            │
          │                            │
┌─────────┼────────────────────────────┼───────────────────────────┐
│         │    SUPABASE CLOUD          │     STRIPE CLOUD          │
├─────────▼────────────────────────────▼───────────────────────────┤
│                                                                   │
│  ┌──────────────────┐        ┌──────────────────┐               │
│  │  Edge Function   │───────▶│   Stripe API     │               │
│  │  (create-payment-│        │                  │               │
│  │    -intent)      │        │  - Validate card │               │
│  │                  │◀───────│  - Charge $49.99 │               │
│  │  Uses:           │        │  - Return status │               │
│  │  STRIPE_SECRET_KEY        └──────────────────┘               │
│  └──────────────────┘                                            │
│         │                                                         │
│         │ 3. Return client_secret                                │
│         ▼                                                         │
│  ┌──────────────────┐                                            │
│  │  Supabase DB     │                                            │
│  │  - payments      │◀─── 4. Record payment                     │
│  │  - enrollments   │◀─── 5. Enroll user                        │
│  │  - profiles      │◀─── 6. Create profile                     │
│  └──────────────────┘                                            │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 💾 Where Things Are Stored

### Your Computer (Local Development)

```
/Users/sesanjoel/Desktop/BraveFx/
├── supabase/
│   └── functions/
│       └── create-payment-intent/
│           └── index.ts               ← Edge Function code (local)
├── src/
│   ├── app/
│   │   └── core/services/
│   │       └── payment.service.ts     ← Calls Edge Function
│   └── environments/
│       └── environment.ts             ← Publishable key (safe)
```

### Supabase Cloud (After Deployment)

```
https://ppbshpbicprzorjcilcn.supabase.co/
├── functions/v1/
│   └── create-payment-intent          ← Edge Function (deployed)
├── rest/v1/
│   ├── payments                        ← Database table
│   └── enrollments                     ← Database table
└── secrets/
    └── STRIPE_SECRET_KEY               ← Encrypted secret
```

### Stripe Cloud

```
https://api.stripe.com/
└── payment_intents/                    ← All your payments
    └── pi_3ABC123...                   ← Individual payment
```

---

## 🛠️ Deployment: CLI vs Dashboard

### Option 1: Supabase CLI (Recommended)

**Pros:**

- ✅ Fast updates (`supabase functions deploy`)
- ✅ Code stays in Git (version control)
- ✅ Can test locally (`supabase functions serve`)
- ✅ Can deploy multiple functions at once

**Cons:**

- ❌ Requires installing CLI
- ❌ Need to learn CLI commands

**Setup:**

```bash
# One-time setup
npm install -g supabase
supabase login
supabase link --project-ref ppbshpbicprzorjcilcn

# Deploy function
supabase functions deploy create-payment-intent

# Update function (after code changes)
supabase functions deploy create-payment-intent
```

### Option 2: Supabase Dashboard

**Pros:**

- ✅ No CLI needed
- ✅ Visual interface
- ✅ Can edit code directly in browser

**Cons:**

- ❌ Manual copy-paste
- ❌ No version control
- ❌ Harder to manage multiple functions
- ❌ Can't test locally

**Setup:**

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **"Create a new function"**
3. Name: `create-payment-intent`
4. Copy code from `supabase/functions/create-payment-intent/index.ts`
5. Paste into editor
6. Click **"Deploy"**

---

## 🔐 Security Best Practices

### ✅ DO:

- Use Edge Functions for secret keys
- Validate amounts on server
- Enable RLS on all database tables
- Use HTTPS in production
- Restrict CORS to your domain in production
- Log errors for debugging

### ❌ DON'T:

- Put secret keys in frontend code
- Trust amounts from frontend (always validate)
- Expose database credentials
- Use `Access-Control-Allow-Origin: *` in production
- Skip error handling
- Ignore Stripe webhook events (for advanced setups)

---

## 🧪 Testing Edge Functions Locally

```bash
# Start Edge Function locally
supabase functions serve create-payment-intent

# In another terminal, test it
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/create-payment-intent' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"amount": 4999}'

# Should return:
# {"clientSecret":"pi_3ABC..."}
```

---

## 📊 Monitoring in Production

### Check Edge Function Logs

```bash
# View real-time logs
supabase functions logs create-payment-intent --follow

# Or in Supabase Dashboard:
# Edge Functions → create-payment-intent → Logs
```

### What to monitor:

- ✅ Successful payment intents
- ❌ Validation errors (amount < 50)
- ❌ Stripe API errors
- ❌ CORS errors
- ⏱️ Function execution time

---

## 🚀 Summary

**Edge Functions = Secure Backend for Your Frontend**

- Run on Supabase servers (not your computer)
- Hide secret keys from users
- Process payments securely
- Scale automatically
- Deploy with one command

**Your checkout flow:**

1. User enters card → Stripe Elements
2. User clicks pay → Call Edge Function
3. Edge Function → Creates Payment Intent with Stripe
4. Frontend → Confirms payment with card
5. Backend → Records payment + enrollment
6. User → Redirected to dashboard

**You're ready to accept payments securely!** 🎉
