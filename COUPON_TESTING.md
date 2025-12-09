# Testing the Coupon System

## Setup Instructions

### 1. Run the Database Migration

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/ppbshpbicprzorjcilcn
2. Go to **SQL Editor**
3. Copy the entire contents of `database-migrations/create-coupons-table.sql`
4. Paste and click **Run**
5. Verify tables created:
   ```sql
   SELECT * FROM public.coupons;
   SELECT * FROM public.coupon_redemptions;
   ```

### 2. Test Coupon URLs

Start your development server:

```bash
ng serve
```

Then test these URLs:

#### ✅ Valid 50% Off Coupon

```
http://localhost:4200/checkout?coupon=LAUNCH50
```

**Expected:**

- Loading overlay appears briefly
- Green success banner: "🎉 LAUNCH50 applied! You save $24.99"
- Original price ($49.99) shows with strikethrough
- Discount row: "-$24.99"
- Final price: $25.00 (in green)
- Savings badge: "🎉 You save $24.99!"
- Purchase button: "Complete Purchase - $25.00"

#### ✅ Valid 30% Off Coupon

```
http://localhost:4200/checkout?coupon=EARLYBIRD
```

**Expected:**

- 30% discount applied
- Final price: $34.99

#### ✅ Valid $10 Off Coupon

```
http://localhost:4200/checkout?coupon=WELCOME10
```

**Expected:**

- Fixed $10 discount
- Final price: $39.99

#### ❌ Expired Coupon

```
http://localhost:4200/checkout?coupon=EXPIRED
```

**Expected:**

- Orange warning banner: "⚠️ Coupon 'EXPIRED' is This coupon has expired"
- Banner auto-dismisses after 4 seconds
- Normal pricing shown ($49.99)

#### ❌ Inactive Coupon

```
http://localhost:4200/checkout?coupon=INACTIVE
```

**Expected:**

- Orange warning banner with error message
- Normal pricing

#### ❌ Invalid Coupon

```
http://localhost:4200/checkout?coupon=FAKE123
```

**Expected:**

- Orange warning banner: "⚠️ Coupon 'FAKE123' is Coupon code not found"
- Normal pricing

#### 🔄 No Coupon

```
http://localhost:4200/checkout
```

**Expected:**

- No banners
- Normal pricing ($49.99)
- No discount information shown

### 3. Test Full Purchase Flow

1. Visit: `http://localhost:4200/checkout?coupon=LAUNCH50`
2. Wait for success banner
3. Fill in test details:
   - **Name**: Test User
   - **Email**: test@example.com
   - **Password**: testpass123
4. Fill in test card (Stripe test mode):
   - **Card**: 4242 4242 4242 4242
   - **Expiry**: 12/34
   - **CVV**: 123
5. Check "I agree to terms"
6. Click "Complete Purchase - $25.00"

**Expected:**

- Payment processes for $25.00 (not $49.99)
- User account created
- Enrolled in course
- Coupon redemption recorded
- Redirect to dashboard

### 4. Verify in Database

After successful test purchase:

```sql
-- Check coupon usage incremented
SELECT code, times_used FROM public.coupons WHERE code = 'LAUNCH50';
-- Should show times_used = 1

-- Check redemption recorded
SELECT * FROM public.coupon_redemptions
ORDER BY redeemed_at DESC LIMIT 1;
-- Should show your test purchase with amount_saved = 24.99

-- Check payment amount
SELECT amount FROM public.payments
ORDER BY created_at DESC LIMIT 1;
-- Should show 2500 (cents) = $25.00
```

## Visual Checklist

### Mobile Testing

- [ ] Validation overlay covers entire screen
- [ ] Success/error banner visible at top
- [ ] Discount details visible in order summary
- [ ] Savings badge clearly visible

### Desktop Testing

- [ ] Notification banner slides down smoothly
- [ ] Close button on banner works
- [ ] Auto-dismiss after 5 seconds
- [ ] Price updates are clear
- [ ] Savings badge has subtle pulse animation

### Edge Cases

- [ ] Uppercase coupon codes work (LAUNCH50)
- [ ] Lowercase coupon codes work (launch50)
- [ ] Whitespace trimmed from codes
- [ ] Multiple coupons in same session (refresh with different code)
- [ ] Expired coupon doesn't block checkout
- [ ] Max uses limit respected

## Create Your Own Coupons

### Holiday Sale (20% off, limited time)

```sql
INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
VALUES ('HOLIDAY20', 'percentage', 20, true, now() + interval '14 days', 200);
```

Test URL: `http://localhost:4200/checkout?coupon=HOLIDAY20`

### Affiliate Code (15% off, unlimited)

```sql
INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
VALUES ('PARTNER15', 'percentage', 15, true, NULL, NULL);
```

Test URL: `http://localhost:4200/checkout?coupon=PARTNER15`

### Flash Sale ($15 off, 1 hour only)

```sql
INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
VALUES ('FLASH15', 'fixed', 15, true, now() + interval '1 hour', 50);
```

Test URL: `http://localhost:4200/checkout?coupon=FLASH15`

## Production Deployment

Before going live:

1. **Remove test coupons**:

   ```sql
   DELETE FROM public.coupons WHERE code IN ('EXPIRED', 'INACTIVE');
   ```

2. **Create real launch coupon**:

   ```sql
   INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
   VALUES ('LAUNCH2025', 'percentage', 40, true, '2025-01-15', 500);
   ```

3. **Share link**:

   ```
   https://bravefx.io/checkout?coupon=LAUNCH2025
   ```

4. **Monitor usage**:
   ```sql
   SELECT
     code,
     times_used,
     max_uses,
     expires_at,
     (max_uses - times_used) as remaining
   FROM public.coupons
   WHERE active = true
   ORDER BY times_used DESC;
   ```

## Troubleshooting

### Coupon not applying

1. Check browser console for errors
2. Verify coupon exists in database
3. Check if coupon is `active = true`
4. Verify expiration date is in future
5. Check max_uses hasn't been exceeded

### Discount amount wrong

1. Verify `discount_type` is correct ('percentage' or 'fixed')
2. Check `discount_value` in database
3. Ensure course price is loaded before validation

### Redemption not recorded

1. Check console for errors during payment
2. Verify `enrollmentId` is returned from PaymentService
3. Check RLS policies on coupon_redemptions table

---

**Ready to test!** 🚀
Start with the valid LAUNCH50 coupon to see the full experience.
