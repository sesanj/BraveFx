# 🎨 Campaign Banner - Implementation Guide

## Overview

The **Campaign Banner** is a beautiful, compact section that appears just below the hero section when a site-wide campaign is active. It features:

- ✨ Glassmorphic design with animated glow effects
- ⏰ Real-time countdown timer
- 📱 Fully responsive (optimized for mobile, tablet, desktop)
- 🎯 Auto-hides when campaign expires
- 🚀 One-click scroll to pricing section

---

## 🎬 Setup Instructions

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- Add is_default column to coupons table
ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;

-- Create unique constraint (only one default at a time)
CREATE UNIQUE INDEX idx_single_default_coupon
ON coupons (is_default)
WHERE is_default = TRUE;
```

**File:** `database-migrations/add-default-coupon-flag.sql`

### Step 2: Create a Test Campaign

Run this in Supabase SQL Editor:

```sql
INSERT INTO coupons (
  code,
  discount_type,
  discount_value,
  active,
  is_default,
  expires_at,
  max_uses
)
VALUES (
  'BLACKFRIDAY50',
  'percentage',
  50,
  true,
  true, -- Site-wide campaign
  NOW() + INTERVAL '7 days', -- Expires in 7 days
  NULL -- Unlimited uses
);
```

### Step 3: View on Home Page

Visit: `http://localhost:4200/`

**You should see:**

- Beautiful banner under hero section
- "BLACKFRIDAY50" badge
- "50% OFF Everything"
- Countdown timer showing ~7 days
- "Claim Discount" button

---

## 📱 Responsive Design

### Desktop (1024px+)

```
┌─────────────────────────────────────────────────┐
│  [Icon] BLACKFRIDAY50   ⏰ 6d 23h 45m 12s  [CTA] │
│         50% OFF                                  │
└─────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)

```
┌──────────────────────────┐
│  [Icon] BLACKFRIDAY50    │
│         50% OFF          │
│  ⏰ 6d 23h 45m 12s       │
│  [Claim Discount Button] │
└──────────────────────────┘
```

### Mobile (Below 768px)

```
┌─────────────────┐
│      [Icon]     │
│  BLACKFRIDAY50  │
│    50% OFF      │
│ ⏰ 6d 23h 45m   │
│ [Claim Discount]│
└─────────────────┘
```

---

## 🎨 Design Features

### Glassmorphic Card

- Semi-transparent background with backdrop blur
- Subtle border with blue accent
- Elevated shadow for depth

### Animated Elements

1. **Pulsing Glow**: Radial gradient that pulses behind content
2. **Zap Icon**: Scales up/down to draw attention
3. **Button Shine**: Shimmer effect on hover
4. **Real-time Timer**: Updates every second

### Color Scheme

- Background: Dark navy gradient (`#0f172a` → `#1e293b`)
- Accent: Blue gradient (`#3b82f6` → `#2563eb`)
- Text: White with subtle blue gradient
- Borders: Translucent blue (`rgba(59, 130, 246, 0.2)`)

---

## 🔧 Managing Campaigns

### Enable Campaign

```sql
-- Set any coupon as site-wide default
UPDATE coupons
SET is_default = TRUE
WHERE code = 'BLACKFRIDAY50';
```

**Result:** Banner appears immediately on home page

### Switch Campaign

```sql
-- Disable old campaign
UPDATE coupons SET is_default = FALSE WHERE code = 'BLACKFRIDAY50';

-- Enable new campaign
UPDATE coupons SET is_default = TRUE WHERE code = 'NEWYEAR30';
```

**Result:** Banner updates to show new campaign

### Disable Campaign

```sql
-- Remove all site-wide campaigns
UPDATE coupons SET is_default = FALSE;
```

**Result:** Banner disappears from home page

---

## ⏰ Countdown Timer

### Features

- Real-time updates every second
- Shows days, hours, minutes, seconds
- Auto-hides days if less than 1 day remaining
- Automatically removes banner when expired
- Tabular numbers for consistent width

### Expiration Behavior

```sql
-- Campaign expires in 6 hours
UPDATE coupons
SET expires_at = NOW() + INTERVAL '6 hours'
WHERE code = 'FLASH6HR';
```

**Display:**

- `5h 59m 45s` (days hidden when < 1 day)
- Timer counts down in real-time
- At `0h 0m 0s`, banner disappears automatically

---

## 🎯 User Interaction

### "Claim Discount" Button

- Smoothly scrolls to pricing section (`#enroll`)
- Hover: Lifts up with stronger shadow
- Click: Slight press-down effect
- Shine animation on hover

### Visual Hierarchy

1. **Eye catches icon** (animated zap)
2. **Reads code** (BLACKFRIDAY50 badge)
3. **Sees discount** (50% OFF)
4. **Checks time** (countdown creates urgency)
5. **Takes action** (clicks CTA)

---

## 🧪 Testing Scenarios

### Test 1: Campaign Active

```sql
-- Create 2-day campaign
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at)
VALUES ('TEST50', 'percentage', 50, true, true, NOW() + INTERVAL '2 days');
```

**Expected:**

- ✅ Banner appears on home page
- ✅ Shows "TEST50" and "50% OFF"
- ✅ Countdown shows ~2 days
- ✅ Button scrolls to pricing

### Test 2: Campaign Expires

```sql
-- Set expiration to 30 seconds from now
UPDATE coupons
SET expires_at = NOW() + INTERVAL '30 seconds'
WHERE code = 'TEST50';
```

**Expected:**

- ✅ Timer counts down: 29s, 28s, 27s...
- ✅ At 0s, banner disappears automatically
- ✅ Console shows cleanup message

### Test 3: No Campaign

```sql
-- Disable all campaigns
UPDATE coupons SET is_default = FALSE;
```

**Expected:**

- ✅ Banner does not appear
- ✅ Home page shows normally

### Test 4: Fixed Amount Discount

```sql
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at)
VALUES ('SAVE10', 'fixed', 10, true, true, NOW() + INTERVAL '1 day');
```

**Expected:**

- ✅ Banner shows "$10 OFF Everything"
- ✅ Countdown shows ~1 day

---

## 📊 Console Logging

### Campaign Loaded

```
🎯 [Campaign Banner] Active campaign: BLACKFRIDAY50
```

### No Campaign

```
(No logs - banner doesn't render)
```

---

## 🎨 Customization Options

### Change Colors

Edit `campaign-banner.component.css`:

```css
/* Change accent color from blue to red */
.campaign-icon {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.btn-claim {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
```

### Change Animation Speed

```css
/* Faster pulse */
@keyframes pulse-glow {
  /* Change from 3s to 2s */
}

/* Faster zap pulse */
@keyframes zap-pulse {
  /* Change from 2s to 1.5s */
}
```

### Change Countdown Format

Edit `campaign-banner.component.ts`:

```typescript
// Show only hours and minutes
<div class="time-unit">
  <span class="time-value">{{ formatTime(timeRemaining.hours) }}</span>
  <span class="time-label">hrs</span>
</div>
<div class="time-unit">
  <span class="time-value">{{ formatTime(timeRemaining.minutes) }}</span>
  <span class="time-label">min</span>
</div>
```

---

## 🚀 Production Checklist

Before launching a campaign:

- [ ] Database migration executed (`is_default` column exists)
- [ ] Test campaign created and verified
- [ ] Banner appears correctly on desktop
- [ ] Banner appears correctly on tablet
- [ ] Banner appears correctly on mobile
- [ ] Countdown updates every second
- [ ] CTA button scrolls to pricing
- [ ] Banner disappears when campaign expires
- [ ] No console errors
- [ ] Performance tested (no slowdown)

---

## 💡 Pro Tips

### Black Friday Campaign

```sql
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at)
VALUES (
  'BLACKFRIDAY70',
  'percentage',
  70,
  true,
  true,
  '2025-11-30 23:59:59' -- Specific end time
);
```

### Flash Sale (6 Hours)

```sql
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at)
VALUES (
  'FLASH6HR',
  'percentage',
  40,
  true,
  true,
  NOW() + INTERVAL '6 hours'
);
```

### Launch Week

```sql
INSERT INTO coupons (code, discount_type, discount_value, active, is_default, expires_at)
VALUES (
  'LAUNCH30',
  'percentage',
  30,
  true,
  true,
  NOW() + INTERVAL '7 days'
);
```

---

## 🎯 Key Features Summary

✅ **Beautiful Design**: Glassmorphic card with glow effects  
✅ **Real-time Countdown**: Updates every second  
✅ **Fully Responsive**: Optimized for all devices  
✅ **Auto-expires**: Disappears when campaign ends  
✅ **Database-driven**: No code changes needed  
✅ **Performance**: Lightweight, no impact on page load  
✅ **Accessible**: Semantic HTML, ARIA-friendly

---

**Your campaign banner is ready!** 🎉

Just run the migration, create a campaign, and watch it appear beautifully on your home page!
