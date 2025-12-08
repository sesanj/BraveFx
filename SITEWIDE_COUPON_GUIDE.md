# 🎯 Site-Wide Coupon Campaign Guide

## Overview

This system allows you to run **site-wide campaigns** (like Black Friday, Launch Week, etc.) that override any specific coupon codes. During a site-wide campaign, **everyone** sees the same discount, regardless of what URL they used to visit the site.

---

## 🚀 How It Works

### Priority Order:

1. **Site-wide campaign** (`is_default = true`) - **HIGHEST PRIORITY**
2. Specific coupon from URL (`?coupon=CODE`) - Only applies if no site-wide campaign
3. No discount - No active campaign

### User Experience:

- **With site-wide campaign active**: User with `?coupon=LAUNCH50` still sees the site-wide campaign discount
- **No site-wide campaign**: User with `?coupon=LAUNCH50` sees their specific discount
- **No coupon at all**: User sees regular price

---

## 📋 Setup Instructions

### Step 1: Run Database Migration

Run this SQL in Supabase SQL Editor:

```sql
-- Add is_default column to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Create unique constraint (only one default at a time)
CREATE UNIQUE INDEX idx_single_default_coupon
ON coupons (is_default)
WHERE is_default = TRUE;
```

**Location:** `database-migrations/add-default-coupon-flag.sql`

---

## 🎪 Managing Site-Wide Campaigns

### Enable a Black Friday Campaign

```sql
-- Set BLACKFRIDAY50 as the site-wide default
UPDATE coupons
SET is_default = TRUE
WHERE code = 'BLACKFRIDAY50';
```

**Result:** Everyone sees 50% off Black Friday discount, regardless of any URL coupons

### Switch to a Different Campaign

```sql
-- Disable old campaign
UPDATE coupons
SET is_default = FALSE
WHERE code = 'BLACKFRIDAY50';

-- Enable new campaign
UPDATE coupons
SET is_default = TRUE
WHERE code = 'XMAS25';
```

**Result:** Everyone now sees the Christmas 25% off discount

### Turn OFF Site-Wide Campaigns

```sql
-- Disable all site-wide campaigns
UPDATE coupons
SET is_default = FALSE;
```

**Result:** Users with specific coupon codes see their discounts, others see regular price

---

## 💡 Use Cases

### Black Friday Sale (Site-Wide)

```sql
-- Create coupon
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at, max_uses)
VALUES ('BLACKFRIDAY50', 'percentage', 50, true, true, '2025-11-30', NULL);
```

**Effect:** All visitors see 50% off for Black Friday

### Launch Week Campaign

```sql
-- Create and enable site-wide launch discount
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at, max_uses)
VALUES ('LAUNCH30', 'percentage', 30, true, true, '2025-12-15', NULL);
```

**Effect:** All visitors during launch week get 30% off

### End Campaign, Return to Normal

```sql
-- Turn off site-wide campaign after Black Friday ends
UPDATE coupons
SET is_default = FALSE, active = FALSE
WHERE code = 'BLACKFRIDAY50';
```

**Effect:** Site returns to regular pricing or specific coupon codes only

---

## 🔍 Checking Current Campaign

### View Active Site-Wide Campaign

```sql
SELECT code, discount_type, discount_value, expires_at, times_used
FROM coupons
WHERE is_default = TRUE AND active = TRUE;
```

### View All Campaigns

```sql
SELECT
  code,
  discount_type,
  discount_value,
  is_default,
  active,
  expires_at,
  times_used,
  max_uses
FROM coupons
ORDER BY is_default DESC, created_at DESC;
```

---

## 🎨 Frontend Behavior

### Home Page

- Checks for site-wide campaign first
- Falls back to localStorage coupon if no campaign active
- Shows dynamic badge: "50% OFF - BLACKFRIDAY50" or "Limited Time Offer"
- Updates pricing display accordingly

### Checkout Page

- Checks for site-wide campaign first (overrides everything)
- Falls back to localStorage or URL parameter
- Shows notification: "🎉 50% Off Applied! Site-Wide Campaign - Save $74.50"
- Applies discount to final price

### Console Logging

```
🎯 [Pricing] Site-wide campaign active: BLACKFRIDAY50
🎯 [Checkout] Site-wide campaign active: BLACKFRIDAY50
```

---

## 📊 Example Scenarios

### Scenario 1: Black Friday Active

**Setup:**

```sql
UPDATE coupons SET is_default = TRUE WHERE code = 'BLACKFRIDAY50'; -- 50% off
```

**User Journey:**

1. User clicks `https://bravefx.io/?coupon=LAUNCH30` (30% off)
2. App captures LAUNCH30 but site-wide campaign overrides it
3. User sees: **50% OFF - BLACKFRIDAY50** (not 30% off)
4. Checkout applies: **$74.50** (50% off $149, not 30% off)

### Scenario 2: No Campaign, Specific Coupon

**Setup:**

```sql
UPDATE coupons SET is_default = FALSE; -- No site-wide campaign
```

**User Journey:**

1. User clicks `https://bravefx.io/?coupon=LAUNCH30` (30% off)
2. App captures LAUNCH30 to localStorage
3. User sees: **30% OFF - LAUNCH30**
4. Checkout applies: **$104.30** (30% off $149)

### Scenario 3: Campaign Ends Mid-Day

**Setup:**

```sql
-- Morning: Black Friday active
UPDATE coupons SET is_default = TRUE WHERE code = 'BLACKFRIDAY50';

-- Evening: Campaign ends
UPDATE coupons SET is_default = FALSE WHERE code = 'BLACKFRIDAY50';
```

**Effect:**

- Morning visitors: See 50% off
- Evening visitors: See regular price or specific coupons only

---

## ⚠️ Important Notes

### Only ONE Default at a Time

The database constraint ensures only one coupon can have `is_default = TRUE`. If you try to set a second default:

```sql
-- This will work (disables old, enables new)
UPDATE coupons SET is_default = FALSE; -- Disable all
UPDATE coupons SET is_default = TRUE WHERE code = 'NEWCAMPAIGN';

-- This will FAIL (two defaults at once)
UPDATE coupons SET is_default = TRUE WHERE code = 'CAMPAIGN1';
UPDATE coupons SET is_default = TRUE WHERE code = 'CAMPAIGN2'; -- ❌ ERROR
```

### Expiration Still Applies

Even with `is_default = TRUE`, expired coupons won't show:

```sql
-- This won't show if expires_at has passed
UPDATE coupons
SET is_default = TRUE, expires_at = '2025-11-30'
WHERE code = 'BLACKFRIDAY50';
-- After Nov 30, automatically stops showing
```

### Max Uses Still Enforced

Site-wide campaigns still respect `max_uses`:

```sql
-- Limited to 100 uses
INSERT INTO coupons (code, discount_value, is_default, max_uses)
VALUES ('LIMITED50', 50, true, 100);
-- After 100 redemptions, automatically stops
```

---

## 🛠️ Testing

### Test Site-Wide Campaign

```sql
-- 1. Create test campaign
INSERT INTO coupons (code, discount_type, discount_value, active, is_default)
VALUES ('TEST50', 'percentage', 50, true, true);

-- 2. Visit site: http://localhost:4200/
-- Expected: See "50% OFF - TEST50" badge

-- 3. Visit with different coupon: http://localhost:4200/?coupon=OTHER30
-- Expected: Still see "50% OFF - TEST50" (campaign overrides)

-- 4. Disable campaign
UPDATE coupons SET is_default = FALSE WHERE code = 'TEST50';

-- 5. Refresh page
-- Expected: Now see "30% OFF - OTHER30" (specific coupon shows)
```

---

## 📈 Reporting

### Track Campaign Performance

```sql
SELECT
  c.code,
  c.discount_type,
  c.discount_value,
  c.times_used,
  COUNT(cr.id) as redemptions,
  SUM(cr.amount_saved) as total_saved
FROM coupons c
LEFT JOIN coupon_redemptions cr ON c.id = cr.coupon_id
WHERE c.is_default = TRUE
GROUP BY c.id;
```

### Revenue Impact

```sql
SELECT
  DATE(cr.redeemed_at) as date,
  COUNT(*) as redemptions,
  SUM(cr.amount_saved) as discount_given,
  SUM(p.amount) as revenue_generated
FROM coupon_redemptions cr
JOIN payments p ON cr.enrollment_id::text = p.metadata->>'enrollmentId'
WHERE cr.coupon_id = (SELECT id FROM coupons WHERE code = 'BLACKFRIDAY50')
GROUP BY DATE(cr.redeemed_at)
ORDER BY date DESC;
```

---

## 🎯 Quick Reference

| Action           | SQL Command                                                        |
| ---------------- | ------------------------------------------------------------------ |
| Enable campaign  | `UPDATE coupons SET is_default = TRUE WHERE code = 'YOURCODE';`    |
| Disable campaign | `UPDATE coupons SET is_default = FALSE;`                           |
| Switch campaigns | Disable old, then enable new                                       |
| Check active     | `SELECT * FROM coupons WHERE is_default = TRUE AND active = TRUE;` |
| View stats       | `SELECT code, times_used FROM coupons WHERE is_default = TRUE;`    |

---

**That's it!** You can now manage site-wide campaigns without touching any code. Just update the database and the entire site updates instantly. 🚀
