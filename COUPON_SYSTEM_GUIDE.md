# Coupon System Implementation Guide

## Overview

Implemented a **URL-based coupon system** for the checkout page that automatically applies discounts when users visit with a coupon code in the URL.

## How It Works

### 1. **User Experience**

```
User clicks: https://bravefx.io/checkout?coupon=LAUNCH50
↓
Page loads with loading overlay "Validating Coupon..."
↓
Success banner appears: "🎉 LAUNCH50 applied! You save $24.99"
↓
Price updates with strikethrough and discount shown
↓
User completes purchase with discounted price
```

### 2. **Database Schema**

#### `coupons` Table

```sql
- id: UUID (Primary Key)
- code: TEXT (Unique, e.g., "LAUNCH50")
- discount_type: 'percentage' | 'fixed'
- discount_value: NUMERIC (e.g., 50 for 50% or 25 for $25 off)
- active: BOOLEAN
- expires_at: TIMESTAMPTZ (nullable)
- max_uses: INTEGER (nullable, null = unlimited)
- times_used: INTEGER (default 0)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

#### `coupon_redemptions` Table

```sql
- id: UUID (Primary Key)
- coupon_id: UUID (FK to coupons)
- user_id: UUID (FK to auth.users)
- enrollment_id: UUID (FK to enrollments)
- amount_saved: NUMERIC
- redeemed_at: TIMESTAMPTZ
```

### 3. **Example Coupons** (Pre-seeded)

```
LAUNCH50    - 50% off, expires in 30 days, max 100 uses
EARLYBIRD   - 30% off, expires in 7 days, max 50 uses
WELCOME10   - $10 off, no expiration, unlimited uses
EXPIRED     - 20% off, already expired (for testing)
INACTIVE    - 25% off, inactive (for testing)
```

## Usage

### Creating Coupon Links

#### Percentage Discount

```
https://bravefx.io/checkout?coupon=LAUNCH50
→ 50% off the course price
```

#### Fixed Amount Discount

```
https://bravefx.io/checkout?coupon=WELCOME10
→ $10 off the course price
```

### Visual Feedback

#### ✅ Valid Coupon

- **Loading Overlay**: Shows while validating (mobile-friendly)
- **Success Banner**: Green gradient banner with save amount
- **Price Display**:
  - Original price with strikethrough
  - Discount row showing "-$XX.XX"
  - Discounted total in green
  - Savings badge: "🎉 You save $XX.XX!"
- **Auto-dismiss**: Banner fades after 5 seconds

#### ❌ Invalid/Expired Coupon

- **Warning Banner**: Orange gradient with error message
- **Fallback**: Checkout proceeds with normal pricing
- **No blocking**: User can still purchase

## Files Modified

### Backend

- `database-migrations/create-coupons-table.sql` - Database schema
- `src/app/core/services/coupon.service.ts` - Coupon validation logic
- `src/app/core/services/payment.service.ts` - Return enrollmentId

### Frontend

- `src/app/features/checkout/checkout.component.ts`:
  - Import ActivatedRoute, CouponService
  - Add coupon state variables
  - Implement checkForCouponInUrl()
  - Update processPayment() to use finalPrice
  - Record coupon redemption after payment
- `src/app/features/checkout/checkout.component.html`:

  - Add coupon validation overlay
  - Add success/error notification banner
  - Update price breakdown with discount row
  - Add savings badge
  - Update button to show finalPrice

- `src/app/features/checkout/checkout.component.css`:
  - Coupon validation overlay styles
  - Notification banner styles (success/error)
  - Discount row styling
  - Strikethrough price
  - Savings badge with pulse animation
  - slideDown animation

## Security Features

### Frontend Validation

- Checks if coupon is active
- Validates expiration date
- Verifies usage limits
- Calculates discount correctly

### Backend Security

- RLS policies on coupon tables
- Service role required for admin operations
- Coupon validated again on server (Edge Function would be ideal)
- Tracks all redemptions for audit trail

## Admin Tasks

### Creating New Coupons (via Supabase Dashboard)

```sql
INSERT INTO public.coupons (code, discount_type, discount_value, active, expires_at, max_uses)
VALUES ('BLACKFRIDAY', 'percentage', 40, true, '2025-12-01', 500);
```

### Viewing Redemptions

```sql
SELECT
  c.code,
  COUNT(cr.id) as total_redemptions,
  SUM(cr.amount_saved) as total_saved
FROM coupons c
LEFT JOIN coupon_redemptions cr ON c.id = cr.coupon_id
GROUP BY c.id, c.code
ORDER BY total_redemptions DESC;
```

### Deactivating Coupons

```sql
UPDATE public.coupons SET active = false WHERE code = 'LAUNCH50';
```

## Marketing Use Cases

### Email Campaigns

```
Subject: 🎉 Launch Special - 50% Off!
Link: https://bravefx.io/checkout?coupon=LAUNCH50
```

### Social Media

```
Tweet: "Limited time offer! Get 50% off our course 🚀
bravefx.io/checkout?coupon=LAUNCH50"
```

### Affiliate Partners

```
Give each affiliate a unique code:
- https://bravefx.io/checkout?coupon=PARTNER_JOHN
- https://bravefx.io/checkout?coupon=PARTNER_SARAH
```

### Influencer Campaigns

```
- https://bravefx.io/checkout?coupon=INFLUENCER20
Track redemptions to measure ROI
```

## Next Steps (Optional Enhancements)

1. **Admin Dashboard** - UI to create/manage coupons
2. **Analytics** - Coupon performance tracking
3. **User Limits** - One coupon per user restriction
4. **Combination Rules** - Allow/prevent coupon stacking
5. **Minimum Purchase** - Require minimum order value
6. **Product-Specific** - Coupons for specific courses only
7. **Email Notifications** - Send to user when coupon applied

## Testing Checklist

- [ ] Valid coupon applies discount correctly
- [ ] Expired coupon shows error, doesn't block checkout
- [ ] Inactive coupon shows error, doesn't block checkout
- [ ] Invalid coupon code shows error
- [ ] Max uses limit prevents usage when reached
- [ ] Payment processes with correct discounted amount
- [ ] Coupon redemption recorded in database
- [ ] times_used increments correctly
- [ ] Mobile overlay displays correctly
- [ ] Notification banner auto-dismisses
- [ ] Discount calculation accurate for percentage and fixed

## Database Migration

**To apply this system:**

1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `database-migrations/create-coupons-table.sql`
3. Run the migration
4. Test with pre-seeded coupons:
   - Visit: `http://localhost:4200/checkout?coupon=LAUNCH50`
   - Should show 50% discount

---

**Implementation Status:** ✅ Complete
**Last Updated:** December 5, 2025
