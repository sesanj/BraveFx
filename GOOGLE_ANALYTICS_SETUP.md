# Google Analytics 4 Setup Guide

## What Was Added

✅ Google Analytics 4 tracking script in `index.html`
✅ Environment variable for GA Measurement ID
✅ Conversion tracking on successful purchases

## Setup Steps (15 minutes)

### Step 1: Create Google Analytics Account

1. Go to: https://analytics.google.com
2. Click **"Start measuring"**
3. Enter account name: `BraveFx`
4. Click **Next**

### Step 2: Create Property

1. Property name: `BraveFx Academy`
2. Reporting time zone: Choose yours (e.g., `United States - Eastern Time`)
3. Currency: `United States Dollar`
4. Click **Next**

### Step 3: Configure Business Details

1. Industry: `Education`
2. Business size: `Small` (1-10 employees)
3. How you plan to use Google Analytics: Check `Measure customer engagement` and `Examine user behavior`
4. Click **Create**
5. Accept Terms of Service

### Step 4: Set Up Data Stream

1. Platform: Click **Web**
2. Website URL: `https://bravefx.io`
3. Stream name: `BraveFx Website`
4. Click **Create stream**

### Step 5: Get Your Measurement ID

You'll see a screen showing:

```
Measurement ID: G-XXXXXXXXXX
```

**Copy this ID!** It looks like `G-ABC123XYZ`

### Step 6: Add ID to Your Application

Open these two files and replace `G-XXXXXXXXXX` with your actual Measurement ID:

1. **src/index.html** - Line 6 and 10 (replace both instances)
2. **src/environments/environment.ts** - Line 15
3. **src/environments/environment.development.ts** - Line 11

Example:

```typescript
// Before
googleAnalyticsId: 'G-XXXXXXXXXX',

// After
googleAnalyticsId: 'G-ABC123XYZ', // Your actual ID
```

And in index.html:

```html
<!-- Before -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  gtag("config", "G-XXXXXXXXXX");
</script>

<!-- After -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"></script>
<script>
  gtag("config", "G-ABC123XYZ");
</script>
```

### Step 7: Deploy & Test

1. Deploy your updated site
2. Visit your website
3. Go back to Google Analytics
4. Click **Reports > Realtime**
5. You should see yourself as an active user!

## What Gets Tracked Automatically

✅ **Page views** - Every page a user visits
✅ **Sessions** - User sessions and duration
✅ **Traffic sources** - Where visitors come from
✅ **Geographic location** - Country, city
✅ **Devices** - Desktop, mobile, tablet
✅ **Browsers** - Chrome, Safari, Firefox, etc.
✅ **Conversions** - Successful purchases (we added this)

## Where to View Your Data

### 1. Real-time Data

**Reports > Realtime**

- See visitors on your site right now
- Which pages they're viewing
- Where they're from

### 2. Page Views

**Reports > Engagement > Pages and screens**

- Most popular pages
- Time on page
- Bounce rate

### 3. Traffic Sources

**Reports > Acquisition > Traffic acquisition**

- Organic (Google search)
- Direct (typed URL)
- Referral (from other sites)
- Social (Instagram, YouTube, etc.)

### 4. Geographic Data

**Reports > User > Demographics > Demographics detail**

- Countries
- Cities
- Languages

### 5. Conversions (Purchases)

**Reports > Monetization > Purchases**

- Total revenue
- Number of purchases
- Average order value

### 6. User Behavior

**Reports > Engagement > Events**

- All tracked events
- Purchase events will show here

## Understanding Your Reports

### Key Metrics to Watch:

| Metric                   | What It Means                          | Where to Find It   |
| ------------------------ | -------------------------------------- | ------------------ |
| **Users**                | Unique visitors                        | Home screen        |
| **Sessions**             | Total visits (users can have multiple) | Home screen        |
| **Bounce Rate**          | % who leave after 1 page               | Engagement > Pages |
| **Avg Session Duration** | How long people stay                   | Home screen        |
| **Traffic Source**       | Where visitors come from               | Acquisition        |
| **Conversion Rate**      | % who purchase                         | Monetization       |
| **Revenue**              | Total sales                            | Monetization       |

### Important Pages to Track:

1. **Home page** (`/`) - How many visitors you get
2. **Checkout page** (`/checkout`) - How many start checkout
3. **Conversion rate** = Purchases ÷ Checkout views

## Privacy & Cookie Notice

Add this to your footer (already done if you have a privacy policy):

```html
<p class="text-sm text-gray-500">
  We use Google Analytics to improve your experience.
  <a href="/privacy-policy">Privacy Policy</a>
</p>
```

For US-based sites, this is sufficient. No popup banner needed.

## Troubleshooting

### "No data showing"

- Wait 24-48 hours for full data
- Real-time should show within minutes
- Make sure you replaced `G-XXXXXXXXXX` with your actual ID

### "Can't see conversions"

- Go to **Reports > Monetization > Purchases**
- Make a test purchase to verify tracking
- Check if `gtag` function exists: Open browser console, type `gtag` and press Enter

### "Wrong measurement ID"

- Check both `index.html` (2 places) and environment files
- Make sure all 3 places have the SAME ID
- Redeploy after changes

## Advanced Setup (Optional)

### Track Specific Events

Add custom tracking anywhere in your components:

```typescript
// Track button click
(window as any).gtag("event", "button_click", {
  button_name: "Start Free Trial",
  page_location: window.location.href,
});

// Track video play
(window as any).gtag("event", "video_play", {
  video_title: "Course Preview",
});

// Track form submission
(window as any).gtag("event", "form_submit", {
  form_name: "Contact Form",
});
```

## Next Steps

1. ✅ Complete setup (15 mins)
2. ✅ Deploy to production
3. ✅ Wait 24-48 hours for data
4. ✅ Check reports weekly
5. ✅ Optimize based on data

## Cost

**$0/month** - Google Analytics 4 is completely free with no limits on traffic.

## Support

- **Google Analytics Help**: https://support.google.com/analytics
- **GA4 YouTube Channel**: Search "Google Analytics 4 tutorial"
- **Documentation**: https://developers.google.com/analytics/devguides/collection/ga4

---

**That's it!** You now have enterprise-level analytics for free. 🎉
