# 🚀 Quick Start Guide - Stripe Checkout

## Complete in 10 Minutes!

### Step 1: Get Stripe Keys (2 min)

1. Go to https://stripe.com and sign up
2. Navigate to **Developers → API Keys**
3. Copy **Publishable key** (starts with `pk_test_`)
4. Copy **Secret key** (starts with `sk_test_`)

### Step 2: Update Environment Files (1 min)

Replace in **both** files:

- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

```typescript
stripe: {
  publishableKey: 'pk_test_YOUR_KEY_HERE', // Paste your publishable key
},
```

### Step 3: Deploy Edge Function (3 min)

**What is an Edge Function?**
A serverless function that runs on Supabase servers (not your frontend). It securely creates Stripe Payment Intents using your secret key, which should NEVER be exposed in your Angular app.

**Deploy using Supabase CLI:**

```bash
# Install Supabase CLI (one-time setup)
# Use Homebrew (macOS/Linux):
brew install supabase/tap/supabase

# Login to your Supabase account
supabase login

# Link this project to your Supabase project
supabase link --project-ref ppbshpbicprzorjcilcn

# Store your Stripe secret key securely in Supabase
# (This is NOT in your code, it's in Supabase's encrypted vault)
supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Deploy the Edge Function code to Supabase servers
# This uploads supabase/functions/create-payment-intent/index.ts
supabase functions deploy create-payment-intent
```

**What happens:**

- Your function becomes available at:
  `https://ppbshpbicprzorjcilcn.supabase.co/functions/v1/create-payment-intent`
- Your Angular app calls this URL to create payments
- Secret key stays secure on Supabase servers

### Step 4: Create Database Tables (2 min)

**These are SQL commands that create tables in your database:**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Open `database-migrations/create-payments-table.sql` in VS Code
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. You should see "Success. No rows returned"
8. Repeat steps 2-7 for `database-migrations/create-enrollments-table.sql`

**What this creates:**

- `payments` table - Tracks all Stripe transactions
- `enrollments` table - Tracks which users enrolled in which courses
- RLS policies - Security rules so users only see their own data

### Step 5: Test! (2 min)

```bash
# Start your app
npm start

# Navigate to
http://localhost:4200/checkout

# Use test card
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

---

## ✅ Success Checklist

- [ ] Stripe account created
- [ ] API keys copied
- [ ] Environment files updated
- [ ] Supabase CLI installed
- [ ] Project linked
- [ ] Secret key set
- [ ] Edge Function deployed
- [ ] Database tables created
- [ ] Test payment successful
- [ ] User redirected to dashboard

---

## 🐛 Quick Troubleshooting

**Can't deploy Edge Function?**

```bash
# Make sure you're logged in
supabase login

# Check if linked
supabase projects list
```

**SQL Error: "policy already exists" or "table already exists"?**

- This means the table/policy is already created - **this is fine!**
- Skip to the next step
- Or use `DROP TABLE payments CASCADE;` to start fresh (careful: deletes data!)

**Payment fails?**

- Check browser console for errors
- Verify Edge Function is deployed: `supabase functions list`
- Check Edge Function logs: `supabase functions logs create-payment-intent`

**User not created?**

- Verify database tables exist in Supabase dashboard
- Check RLS policies are enabled
- Review Supabase logs

---

## 📚 Need More Help?

See the full guides:

- **`STRIPE_SETUP_INSTRUCTIONS.md`** - Detailed setup guide
- **`CHECKOUT_IMPLEMENTATION.md`** - Complete technical documentation

---

**You're ready to accept payments!** 🎉
