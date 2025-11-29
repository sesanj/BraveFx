# 🚀 Test Mode to Live Mode - Complete Transition Guide

## 📋 Overview

This guide covers everything you need to do to transition from Stripe Test Mode (sandbox) to Live Mode (real payments). Follow these steps carefully before accepting real customer payments.

---

## 🧪 PHASE 1: Test Mode Setup (Development)

### Current Status: TESTING WITH SANDBOX

**Purpose:** Develop and test your checkout flow without real money.

### Required Configuration:

#### 1. Stripe API Keys (Test Mode)

```
Stripe Dashboard → Developers → API Keys → Test Mode
```

**Get these keys:**

- **Publishable Key:** `pk_test_...`
- **Secret Key:** `sk_test_...`

#### 2. Frontend Configuration

**File:** `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false, // ← Keep as false
  supabase: {
    url: "https://ppbshpbicprzorjcilcn.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  stripe: {
    publishableKey: "pk_test_YOUR_TEST_KEY_HERE", // ← Your test publishable key
  },
  coursePrice: 4999, // $49.99
};
```

**File:** `src/environments/environment.ts`

```typescript
export const environment = {
  production: false, // ← Keep as false for now
  supabase: {
    url: "https://ppbshpbicprzorjcilcn.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  stripe: {
    publishableKey: "pk_test_YOUR_TEST_KEY_HERE", // ← Your test publishable key
  },
  coursePrice: 4999,
};
```

#### 3. Backend Configuration (Supabase Edge Function)

**Set secret key in Supabase Vault:**

```bash
# Install Supabase CLI (one time)
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref ppbshpbicprzorjcilcn

# Set TEST secret key
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Deploy Edge Function
supabase functions deploy create-payment-intent
```

**Edge Function Code:** `supabase/functions/create-payment-intent/index.ts`

```typescript
// NO CHANGES NEEDED - This line reads from Supabase Vault
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});
```

#### 4. Test Cards to Use

| Card Number           | Result                               |
| --------------------- | ------------------------------------ |
| `4242 4242 4242 4242` | ✅ Success                           |
| `4000 0025 0000 3155` | ⚠️ Requires 3D Secure authentication |
| `4000 0000 0000 9995` | ❌ Declined (insufficient funds)     |
| `4000 0000 0000 0002` | ❌ Declined (generic decline)        |

- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/26`)
- **ZIP:** Any 5 digits (e.g., `12345`)

---

## ✅ PHASE 2: Testing Checklist (Before Going Live)

Complete ALL these tests in Test Mode:

### Happy Path Tests

- [ ] Valid card payment succeeds (4242 4242 4242 4242)
- [ ] User account created in Supabase Auth
- [ ] Profile created in `profiles` table
- [ ] Payment recorded in `payments` table
- [ ] User enrolled in `enrollments` table
- [ ] User auto-logged in after payment
- [ ] Redirected to `/student-dashboard`
- [ ] Can access course content

### Error Handling Tests

- [ ] Declined card shows clear error (4000 0000 0000 9995)
- [ ] Invalid CVV rejected
- [ ] Expired card rejected
- [ ] Duplicate email shows "Email already exists"
- [ ] Weak password rejected (< 8 characters)
- [ ] Password mismatch caught
- [ ] Terms not accepted blocked
- [ ] Empty fields validated

### Security Tests

- [ ] Cannot pay $0.00 or negative amount
- [ ] Amount validation in Edge Function works
- [ ] Secret key not visible in browser DevTools
- [ ] User can only see their own payments (RLS working)
- [ ] Non-authenticated users can't access student dashboard

### Browser/Device Tests

- [ ] Works on Chrome (desktop)
- [ ] Works on Safari (desktop)
- [ ] Works on Firefox (desktop)
- [ ] Works on mobile Safari (iPhone)
- [ ] Works on mobile Chrome (Android)
- [ ] Responsive design looks good on all screens

### Data Verification

- [ ] Check Stripe Dashboard → Payments (Test Mode) shows payment
- [ ] Check Supabase → Auth → Users shows new user
- [ ] Check Supabase → Table Editor → `profiles` shows profile
- [ ] Check Supabase → Table Editor → `payments` shows payment
- [ ] Check Supabase → Table Editor → `enrollments` shows enrollment
- [ ] Payment Intent ID matches in Stripe and database

### Edge Function Tests

```bash
# View Edge Function logs
supabase functions logs create-payment-intent

# Check for errors
# Should see successful payment intent creations
```

---

## 🏢 PHASE 3: Stripe Account Activation (Required Before Live)

Before you can accept real payments, complete Stripe's business verification:

### Step 1: Complete Business Information

**Stripe Dashboard → Settings → Business Information**

Required details:

- [ ] Business name
- [ ] Business type (Individual / Company)
- [ ] Business address
- [ ] Phone number
- [ ] Business website URL
- [ ] Business description (what you sell)
- [ ] Industry category

### Step 2: Identity Verification

**Stripe Dashboard → Settings → Identity Verification**

Required documents:

- [ ] Government-issued ID (Driver's license, Passport, etc.)
- [ ] Social Security Number (US) or Tax ID
- [ ] Date of birth
- [ ] Address verification

**Processing time:** 1-3 business days

### Step 3: Bank Account Connection

**Stripe Dashboard → Settings → Bank Accounts and Scheduling**

Required:

- [ ] Bank account number
- [ ] Routing number (US) or equivalent
- [ ] Account holder name
- [ ] Account type (Checking / Savings)

**Payout schedule options:**

- Daily (recommended)
- Weekly
- Monthly

**Note:** Stripe will send 2 small deposits to verify your bank account.

### Step 4: Tax Information

**Stripe Dashboard → Settings → Tax Settings**

Required:

- [ ] Tax ID (EIN or SSN for US)
- [ ] W-9 form (US) or equivalent
- [ ] Business tax classification

### Step 5: Activate Your Account

Once all steps complete:

- Stripe will review your application
- You'll receive email confirmation (1-3 days)
- Account status changes to "Activated"
- Live mode becomes available

---

## 🔴 PHASE 4: Going Live (Production Deployment)

### Step 1: Get Live API Keys

**Stripe Dashboard → Developers → API Keys**

1. Toggle from "Test Mode" to "Live Mode" (top right)
2. Copy your live keys:
   - **Publishable Key:** `pk_live_...`
   - **Secret Key:** `sk_live_...`

⚠️ **IMPORTANT:**

- Live keys start with `pk_live_` and `sk_live_`
- Never commit live secret key to Git
- Store securely (password manager recommended)

### Step 2: Update Frontend (Production Environment)

**File:** `src/environments/environment.ts`

**REQUIRED CHANGES:**

```typescript
export const environment = {
  production: true, // ← Change to TRUE
  supabase: {
    url: "https://ppbshpbicprzorjcilcn.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  },
  stripe: {
    publishableKey: "pk_live_YOUR_LIVE_PUBLISHABLE_KEY", // ← CHANGE to LIVE key
  },
  coursePrice: 4999,
};
```

**File:** `src/environments/environment.development.ts`

**Keep TEST keys** (for local development):

```typescript
export const environment = {
  production: false,
  supabase: {
    /* ... */
  },
  stripe: {
    publishableKey: "pk_test_...", // ← Keep test key for development
  },
  coursePrice: 4999,
};
```

### Step 3: Update Backend (Supabase Secret)

**Update Stripe secret key in Supabase Vault:**

```bash
# Set LIVE secret key (replaces test key)
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY

# Redeploy Edge Function with new secret
supabase functions deploy create-payment-intent
```

**Verify deployment:**

```bash
# List secrets (won't show values, just names)
supabase secrets list

# Should show:
# STRIPE_SECRET_KEY
```

### Step 4: Update CORS (Security - Recommended)

**File:** `supabase/functions/create-payment-intent/index.ts`

**Change from:**

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // ❌ Allows any domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Change to:**

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com", // ✅ Only your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

**Then redeploy:**

```bash
supabase functions deploy create-payment-intent
```

### Step 5: Build and Deploy to Production

```bash
# Build production bundle
npm run build

# Deploy to Vercel (or your hosting)
vercel --prod

# Or if using different hosting:
# Upload dist/brave-fx/browser/ folder
```

### Step 6: First Live Transaction Test

**Test with YOUR OWN card first:**

1. Go to your production site
2. Use real card (your own)
3. Try small amount first ($0.50 if possible, or $49.99)
4. Complete checkout flow
5. Verify:
   - [ ] Payment appears in Stripe Dashboard (LIVE MODE)
   - [ ] Payment recorded in Supabase `payments` table
   - [ ] User created and enrolled
   - [ ] Email confirmation sent (if enabled)
   - [ ] Can access course

**If successful:**

- ✅ Refund the test payment (Stripe Dashboard → Payment → Refund)
- ✅ Your checkout is live!
- ✅ Ready for real customers

**If failed:**

- Check Supabase Edge Function logs
- Check browser console errors
- Verify environment variables
- Check Stripe Dashboard for error details

---

## 🎯 PHASE 5: Post-Launch Recommended Setup

### 1. Set Up Stripe Webhooks (Recommended)

**Why:** Get real-time notifications when payments succeed/fail.

**Stripe Dashboard → Developers → Webhooks**

1. Click "Add endpoint"
2. Endpoint URL: `https://ppbshpbicprzorjcilcn.supabase.co/functions/v1/stripe-webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `charge.dispute.created`
4. Copy webhook signing secret: `whsec_...`
5. Store in Supabase: `supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...`

**Create webhook Edge Function:**

```bash
supabase functions new stripe-webhook
```

**Webhook benefits:**

- Backup payment verification
- Handle refunds automatically
- Detect disputes/chargebacks
- Async payment processing

### 2. Enable Customer Emails (Recommended)

**Stripe Dashboard → Settings → Emails**

Enable:

- [x] Successful payments
- [x] Failed payments
- [x] Refunds
- [x] Receipts

Customize:

- Add your logo
- Customize email colors
- Add support email

### 3. Configure Email Notifications (Recommended)

**Supabase Dashboard → Authentication → Email Templates**

Customize:

- Welcome email after signup
- Email confirmation
- Password reset email

### 4. Set Up Monitoring (Recommended)

**Create monitoring dashboard:**

```bash
# Monitor Edge Function logs
supabase functions logs create-payment-intent --follow

# Monitor in real-time
```

**Stripe Dashboard → Reports**

- Enable daily email reports
- Set up revenue alerts
- Monitor failed payments

**Supabase Dashboard → Reports**

- Monitor API usage
- Track database growth
- Watch for errors

### 5. Add Analytics (Optional)

**Google Analytics / Mixpanel:**

- Track checkout started
- Track payment succeeded
- Track payment failed
- Calculate conversion rate

**Example event tracking:**

```typescript
// checkout.component.ts
async processPayment() {
  // Track event
  gtag('event', 'begin_checkout', {
    currency: 'USD',
    value: 49.99
  });

  const result = await this.paymentService.confirmCardPayment(...);

  if (result.success) {
    gtag('event', 'purchase', {
      transaction_id: result.paymentIntentId,
      value: 49.99,
      currency: 'USD'
    });
  }
}
```

### 6. Set Up Refund Policy (Recommended)

**Create clear refund policy:**

- How many days for refund? (e.g., 30 days)
- Partial or full refund?
- How to request refund?

**Add to your site:**

- Terms & Conditions page
- Checkout page disclaimer
- Email confirmation

**Implement refund handling:**

```sql
-- Update enrollment status on refund
UPDATE enrollments
SET status = 'refunded'
WHERE user_id = 'xxx' AND course_id = 1;
```

### 7. Enable Fraud Detection (Recommended)

**Stripe Dashboard → Settings → Radar**

Stripe Radar (included):

- [x] Enable machine learning fraud detection
- [x] Block high-risk payments
- [x] 3D Secure for suspicious cards
- [x] Set risk threshold (low/medium/high)

**Custom rules (optional):**

- Block certain countries
- Limit transaction amounts
- Require 3D Secure for large amounts

---

## 📊 Monitoring & Maintenance

### Daily Checks (First Week)

- [ ] Check Stripe Dashboard → Payments (Live)
- [ ] Verify new enrollments in database
- [ ] Check Edge Function logs for errors
- [ ] Monitor customer support emails
- [ ] Check refund requests

### Weekly Checks (Ongoing)

- [ ] Review failed payments (why?)
- [ ] Check dispute/chargeback notices
- [ ] Verify bank payouts received
- [ ] Review analytics/conversion rate
- [ ] Update test environment with production fixes

### Monthly Checks

- [ ] Reconcile Stripe revenue with database
- [ ] Review and respond to disputes
- [ ] Check for security updates
- [ ] Review and optimize conversion rate
- [ ] Update documentation

---

## 🔐 Security Best Practices

### DO:

- ✅ Use HTTPS everywhere (production)
- ✅ Keep secret keys in Supabase Vault only
- ✅ Enable RLS on all database tables
- ✅ Restrict CORS to your domain
- ✅ Use environment variables for keys
- ✅ Enable Stripe Radar fraud detection
- ✅ Monitor logs regularly
- ✅ Keep Stripe SDK updated
- ✅ Use strong passwords for Stripe account
- ✅ Enable 2FA on Stripe account

### DON'T:

- ❌ Commit secret keys to Git
- ❌ Use test keys in production
- ❌ Log sensitive customer data
- ❌ Skip HTTPS in production
- ❌ Disable RLS policies
- ❌ Use `Access-Control-Allow-Origin: *` in production
- ❌ Store card numbers in your database
- ❌ Skip testing before deploying
- ❌ Ignore Stripe webhook events
- ❌ Share API keys via email/Slack

---

## 💰 Stripe Fees & Pricing

### Standard Pricing (US)

```
Per transaction:     2.9% + $0.30
```

### Examples:

```
Sale: $49.99
├── Stripe fee:  $1.75
└── You receive: $48.24

Sale: $99.99
├── Stripe fee:  $3.20
└── You receive: $96.79

Sale: $9.99
├── Stripe fee:  $0.59
└── You receive: $9.40
```

### Additional Fees:

- Refunds: $0 (fee not refunded)
- Chargebacks: $15 per dispute
- International cards: +1.5%
- Currency conversion: +1%

### Payout Schedule:

- **Default:** 2-day rolling (Monday charge → Wednesday payout)
- **Instant:** Available for additional fee
- **Custom:** Set weekly/monthly

---

## 🚨 Troubleshooting Common Issues

### Issue: "Publishable key is invalid"

**Cause:** Using test key in production or vice versa
**Fix:**

```typescript
// Make sure environment.ts has:
publishableKey: 'pk_live_...',  // NOT pk_test_
```

### Issue: "Edge Function returns 400 error"

**Cause:** Secret key not set or incorrect
**Fix:**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY
supabase functions deploy create-payment-intent
```

### Issue: "CORS error when calling Edge Function"

**Cause:** Domain not allowed
**Fix:**

```typescript
// Update CORS in index.ts
'Access-Control-Allow-Origin': 'https://yourdomain.com',
```

### Issue: "Payment succeeds but user not enrolled"

**Cause:** Database policy or table issue
**Fix:**

- Check `enrollments` table exists
- Verify RLS policies allow inserts
- Check Edge Function logs for errors

### Issue: "Bank account not receiving payouts"

**Cause:** Bank verification incomplete
**Fix:**

- Stripe Dashboard → Settings → Bank Accounts
- Verify micro-deposits
- Wait 2-7 days for first payout

---

## ✅ Pre-Launch Checklist

Before accepting your first real customer payment:

### Stripe Setup

- [ ] Stripe account fully activated
- [ ] Business verification completed
- [ ] Bank account connected and verified
- [ ] Live API keys obtained
- [ ] Test mode thoroughly tested

### Code Configuration

- [ ] `environment.ts` has `production: true`
- [ ] `environment.ts` has live publishable key
- [ ] Supabase Vault has live secret key
- [ ] Edge Function redeployed with live secret
- [ ] CORS restricted to production domain

### Database

- [ ] `payments` table created
- [ ] `enrollments` table created
- [ ] RLS policies enabled
- [ ] Test data cleaned up

### Testing

- [ ] All test scenarios pass
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Tested with real card (your own)
- [ ] Verified database records created

### Production Deployment

- [ ] Built with production config
- [ ] Deployed to production hosting
- [ ] SSL/HTTPS enabled
- [ ] Domain configured correctly
- [ ] Environment variables set

### Monitoring

- [ ] Edge Function logs accessible
- [ ] Stripe Dashboard notifications enabled
- [ ] Email alerts configured
- [ ] Analytics tracking setup

### Legal/Business

- [ ] Terms & Conditions published
- [ ] Privacy Policy published
- [ ] Refund Policy defined
- [ ] Support email configured
- [ ] Business email setup

---

## 📞 Support Resources

### Stripe Support

- **Dashboard:** https://dashboard.stripe.com
- **Docs:** https://stripe.com/docs
- **Support:** https://support.stripe.com
- **Status:** https://status.stripe.com

### Supabase Support

- **Dashboard:** https://supabase.com/dashboard
- **Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **Status:** https://status.supabase.com

### Emergency Contacts

- Stripe 24/7 Support: support@stripe.com
- Supabase Support: support@supabase.io

---

## 🎉 You're Ready to Go Live!

Once you've completed all the steps above, you're ready to accept real payments from customers!

**Final reminder:**

1. Test everything thoroughly in Test Mode first
2. Complete Stripe account verification
3. Switch to Live Mode keys
4. Test with your own card
5. Monitor closely for first week
6. Respond quickly to customer issues

**Good luck with your launch!** 🚀
