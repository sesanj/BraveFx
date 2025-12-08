# Checkout Page Countdown Timer

## Overview

A compact countdown timer appears on the checkout page **only for site-wide campaigns** (coupons with `is_default = true`). This creates urgency during active promotional campaigns without overwhelming the checkout experience.

## Features

### ✨ Key Characteristics

- **Compact Design**: Smaller and more subtle than the home page campaign banner
- **Smart Display**: Only shows when a site-wide campaign is active
- **Real-time Updates**: Countdown updates every second
- **Auto-cleanup**: Timer stops and hides when campaign expires
- **Responsive**: Optimized for desktop, tablet, and mobile devices
- **Brand Consistent**: Purple/pink gradient matching BraveFx theme

### 📍 Placement

Located directly below the "Complete Your Purchase" header and above the checkout form sections.

## How It Works

### Automatic Detection

When the checkout page loads, it:

1. **Checks for Site-wide Campaign**: Calls `CouponService.getDefaultCoupon()` to find active campaigns with `is_default = true`
2. **Starts Countdown**: If campaign exists, starts real-time countdown to expiration
3. **Validates Coupon**: Applies discount and shows success notification
4. **Auto-hides on Expiry**: Countdown disappears if campaign expires mid-session

### Priority System

The checkout page follows this priority:

1. **Site-wide Campaign** (is_default = true) - HIGHEST PRIORITY
2. Specific coupon from localStorage or URL parameter
3. No discount

## Design Specifications

### Desktop Layout

```
┌─────────────────────────────────────────────┐
│ 🕐 Offer ends in:   1d:23h:45m:12s          │
└─────────────────────────────────────────────┘
```

### Mobile Layout

```
┌──────────────────┐
│ 🕐 Offer ends in:│
│ 1d:23h:45m:12s   │
└──────────────────┘
```

### Visual Style

- **Background**: Purple/pink gradient with glassmorphic effect
- **Border**: Subtle purple glow (rgba(168, 85, 247, 0.2))
- **Timer Values**: Purple gradient text, bold font
- **Icon**: Clock icon in primary purple
- **Spacing**: Comfortable padding for readability

## Technical Implementation

### TypeScript Properties

```typescript
// Campaign state
isSiteWideCampaign: boolean = false;
campaignTimeRemaining: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} = { days: 0, hours: 0, minutes: 0, seconds: 0 };
private countdownInterval: any = null;
```

### Key Methods

- `startCampaignCountdown(expiresAt)`: Initializes countdown timer
- `updateCampaignCountdown(expiresAt)`: Calculates remaining time
- `stopCampaignCountdown()`: Cleans up interval on destroy or expiration
- `formatTime(value)`: Pads numbers with leading zeros

### Lifecycle Management

- **OnInit**: Detects site-wide campaign and starts countdown
- **OnDestroy**: Cleans up countdown interval to prevent memory leaks
- **Auto-expiry**: Stops countdown and hides timer when campaign ends

## Responsive Breakpoints

### Desktop (Default)

- Horizontal layout: Label on left, timer on right
- Font sizes: 1.125rem values, 0.75rem labels
- Padding: 0.875rem vertical, 1.25rem horizontal

### Mobile (≤480px)

- Vertical layout: Label on top, timer below
- Smaller fonts: 1rem values, 0.6875rem labels
- Reduced padding: 0.75rem vertical, 1rem horizontal

## Usage Examples

### Example 1: Flash Sale

```sql
-- Create 24-hour flash sale
UPDATE coupons
SET is_default = true
WHERE code = 'FLASH24';
```

**Result**: Compact countdown shows "Offer ends in: 23h:59m:45s" on checkout page

### Example 2: Weekend Special

```sql
-- Create weekend campaign (Friday-Sunday)
UPDATE coupons
SET is_default = true
WHERE code = 'WEEKEND50';
```

**Result**: Countdown shows days/hours/minutes/seconds throughout the weekend

### Example 3: Clear Campaign

```sql
-- Remove site-wide campaign
UPDATE coupons
SET is_default = false
WHERE is_default = true;
```

**Result**: Countdown disappears on next page load

## Testing Scenarios

### Test 1: Active Campaign

1. Create site-wide campaign with 2-day expiration
2. Navigate to `/checkout`
3. ✅ Verify countdown appears below header
4. ✅ Verify timer updates every second
5. ✅ Verify discount is applied to order summary

### Test 2: Campaign Expiration

1. Create campaign expiring in 5 minutes
2. Stay on checkout page
3. Wait for expiration
4. ✅ Verify countdown disappears when time reaches 0
5. ✅ Verify discount is removed from order

### Test 3: No Campaign

1. Ensure no coupons have `is_default = true`
2. Navigate to `/checkout`
3. ✅ Verify no countdown appears
4. ✅ Verify checkout form displays normally

### Test 4: Mobile Responsive

1. Create active site-wide campaign
2. View checkout on mobile device (≤480px)
3. ✅ Verify vertical layout
4. ✅ Verify smaller fonts and compact spacing
5. ✅ Verify countdown remains readable

## Performance Considerations

### Optimization Techniques

- **Interval Management**: Single 1-second interval, cleaned up on destroy
- **Conditional Rendering**: `*ngIf` ensures countdown only renders when needed
- **Lightweight Calculations**: Simple math operations every second
- **No External Dependencies**: Pure TypeScript/Angular implementation

### Memory Management

```typescript
ngOnDestroy() {
  this.paymentService.destroyCardElement();
  this.stopCampaignCountdown(); // ✅ Prevents memory leaks
}
```

## Customization

### Adjust Timer Size

In `checkout.component.css`:

```css
.time-value-compact {
  font-size: 1.125rem; /* Increase to 1.25rem for larger */
}
```

### Change Colors

```css
.campaign-countdown-compact {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, /* Blue theme */ rgba(147, 51, 234, 0.05) 100%);
}
```

### Hide Days When Zero

Already implemented! Days only show when `campaignTimeRemaining.days > 0`:

```html
<div class="time-unit-compact" *ngIf="campaignTimeRemaining.days > 0">
  <span class="time-value-compact">{{ formatTime(campaignTimeRemaining.days) }}</span>
  <span class="time-label-compact">d</span>
</div>
```

## Comparison: Home vs Checkout

| Feature        | Home Page Banner        | Checkout Countdown            |
| -------------- | ----------------------- | ----------------------------- |
| **Size**       | Large, prominent        | Compact, subtle               |
| **Layout**     | 3-section grid          | 2-section horizontal/vertical |
| **Animation**  | Pulsing glow background | Static gradient               |
| **CTA Button** | "Claim Discount" scroll | None (already at checkout)    |
| **Icon**       | Zap + Clock             | Clock only                    |
| **Visibility** | Full-width banner       | Inline with form              |

## Best Practices

### ✅ Do

- Use site-wide campaigns sparingly for maximum impact
- Set reasonable expiration times (24-72 hours typical)
- Test countdown accuracy before launching
- Monitor campaign performance in Supabase

### ❌ Don't

- Don't create overlapping site-wide campaigns (database enforces single default)
- Don't extend campaigns indefinitely (reduces urgency)
- Don't remove countdown styles without removing HTML/TypeScript
- Don't forget to clean up expired campaigns from database

## Troubleshooting

### Countdown Not Appearing

1. **Check Database**: `SELECT * FROM coupons WHERE is_default = true;`

   - Ensure exactly one coupon has `is_default = true`
   - Verify `expires_at` is in the future
   - Confirm `is_active = true`

2. **Check Console**: Look for logs:

   - `🎯 [Checkout] Site-wide campaign active: CODE`
   - If missing, no default coupon detected

3. **Verify Component**: Check `checkout.component.ts`
   - `isSiteWideCampaign` should be `true`
   - `campaignTimeRemaining` should have non-zero values

### Countdown Shows Wrong Time

1. **Time Zone Issues**: Ensure `expires_at` is stored in UTC
2. **Client vs Server Time**: Compare `new Date().getTime()` in console
3. **Database Format**: Verify timestamp format matches `new Date(expiresAt)`

### Countdown Doesn't Update

1. **Interval Not Started**: Check console for errors in `startCampaignCountdown()`
2. **Lifecycle Issue**: Ensure `ngOnInit()` is called
3. **Browser Tab Inactive**: Some browsers throttle intervals in background tabs

## Related Documentation

- [SITEWIDE_COUPON_GUIDE.md](./SITEWIDE_COUPON_GUIDE.md) - Managing site-wide campaigns
- [CAMPAIGN_BANNER_GUIDE.md](./CAMPAIGN_BANNER_GUIDE.md) - Home page campaign banner
- [CHECKOUT_IMPLEMENTATION.md](./CHECKOUT_IMPLEMENTATION.md) - Checkout page overview

## Summary

The checkout countdown timer provides a **subtle yet effective** urgency mechanism for site-wide campaigns. Unlike the prominent home page banner, it integrates seamlessly into the checkout flow without distracting from the payment process. This creates a cohesive campaign experience across both key conversion pages while maintaining optimal UX for completing purchases.
