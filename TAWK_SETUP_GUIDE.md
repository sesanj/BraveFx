# Tawk.to Live Chat Setup Guide

## ✅ What's Been Implemented

### Smart Conditional Display

Live chat widget will **only appear** on these pages:

- ✅ **Home Page** (`/`) - First-time visitors
- ✅ **Checkout Page** (`/checkout`) - Critical conversion moment
- ✅ **Reviews Page** (`/reviews`) - Build trust with prospects

### Auto-Hide on Other Pages

Chat widget will be **hidden** on:

- ❌ Dashboard pages
- ❌ Course player
- ❌ Legal pages (Privacy, Terms, etc.)
- ❌ Auth pages (Login, Register)
- ❌ Any other pages

### Smart Features Implemented

1. **Auto visitor identification**: When users are logged in, their name and email are sent to Tawk
2. **Route-aware**: Widget automatically shows/hides as users navigate
3. **Performance optimized**: Loads only when needed
4. **Mobile responsive**: Works perfectly on all devices

---

## 🚀 Setup Steps (5 Minutes)

### Step 1: Create Tawk.to Account

1. Go to [https://www.tawk.to/](https://www.tawk.to/)
2. Click **"Sign Up Free"**
3. Register with your email
4. Verify your email address

### Step 2: Create a Property

1. After login, you'll see the dashboard
2. Click **"Administration"** → **"Property"**
3. Click **"+ Add Property"**
4. Enter:
   - **Property Name**: BraveFx Academy
   - **Property URL**: https://bravefx.io
5. Click **"Add Property"**

### Step 3: Get Your Widget Code

1. Click on your property name
2. Go to **"Administration"** → **"Channels"** → **"Chat Widget"**
3. You'll see a JavaScript code snippet like:

```html
<!--Start of Tawk.to Script-->
<script type="text/javascript">
  var Tawk_API = Tawk_API || {},
    Tawk_LoadStart = new Date();
  (function () {
    var s1 = document.createElement("script"),
      s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = "https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s0.parentNode.insertBefore(s1, s0);
  })();
</script>
<!--End of Tawk.to Script-->
```

4. **Copy the Property ID and Widget ID** from the URL:
   - URL format: `https://embed.tawk.to/5f1234567890abcdef123456/1a2b3c4d`
   - **Property ID**: `5f1234567890abcdef123456` (first part)
   - **Widget ID**: `1a2b3c4d` (second part, or "default")

### Step 4: Update Your Angular App

Open `/src/app/core/services/tawk.service.ts` and replace the placeholder IDs:

**Lines 29-30:**

```typescript
// BEFORE (placeholder):
const propertyId = "YOUR_PROPERTY_ID";
const widgetId = "YOUR_WIDGET_ID";

// AFTER (your actual IDs):
const propertyId = "5f1234567890abcdef123456"; // Your actual Property ID
const widgetId = "1a2b3c4d"; // Your actual Widget ID (or 'default')
```

### Step 5: Customize Widget Appearance

1. In Tawk.to dashboard, go to **"Administration"** → **"Chat Widget"** → **"Widget Appearance"**
2. Customize to match BraveFx purple theme:
   - **Primary Color**: `#a855f7` (Purple)
   - **Widget Position**: Bottom Right
   - **Widget Bubble**: Choose your preferred style
3. Save changes

### Step 6: Test the Integration

1. Start your Angular app: `npm start`
2. Navigate to:
   - **Home page** (`http://localhost:4200/`) - Chat should appear ✅
   - **Checkout page** - Chat should appear ✅
   - **Reviews page** - Chat should appear ✅
   - **Dashboard** - Chat should be hidden ❌
   - **Any legal page** - Chat should be hidden ❌

---

## 🎨 Customization Options in Tawk.to

### Widget Appearance

- **Colors**: Match your brand (purple theme)
- **Position**: Bottom right (default)
- **Bubble Text**: "Need help? Chat with us!"
- **Avatar**: Upload your logo/avatar

### Chat Settings

- **Online/Offline Messages**: Customize greetings
- **Pre-chat Form**: Collect visitor info before chat
- **Away Message**: Set auto-response when offline
- **Sound Notifications**: Enable/disable

### Triggers (Optional)

Set up automated messages based on:

- Time on page
- Pages visited
- Return visitors
- URL contains specific text

Example trigger for checkout page:

- **Condition**: URL contains `/checkout`
- **Message**: "Need help with your purchase? We're here to assist! 💬"
- **Delay**: 10 seconds

---

## 📱 Mobile Apps (Respond Anywhere)

Download Tawk.to apps to respond to chats:

- **iOS**: [App Store](https://apps.apple.com/app/tawk-to-live-chat/id1039656698)
- **Android**: [Google Play](https://play.google.com/store/apps/details?id=com.tawk.copilot)

You'll get push notifications when someone starts a chat!

---

## 🔧 Advanced Features

### 1. Visitor Tracking

See who's browsing your site in real-time:

- Current page
- Location
- Device/browser
- Time on site

### 2. Canned Responses

Create quick replies for common questions:

- "What's included in the course?"
- "How long is access?"
- "Do you offer refunds?"

### 3. Departments (If you grow)

Route chats to different teams:

- Sales
- Technical Support
- Billing

### 4. Knowledge Base Integration

Link to your support articles from chat

---

## 🎯 Best Practices

### Response Times

- **Target**: Under 2 minutes during business hours
- Set **away message** when offline
- Use **mobile app** for quick responses

### Professional Greeting

```
Hi there! 👋 Welcome to BraveFx Academy!

I'm [Your Name]. How can I help you today?

- Questions about our courses?
- Need help with enrollment?
- Technical issues?

I'm here to assist! 😊
```

### Common Questions to Prepare For

1. "What's included in the course?"
2. "How long do I have access?"
3. "Is there a refund policy?"
4. "Do you offer payment plans?"
5. "What experience level is required?"
6. "Can I download the videos?"

---

## 🔍 Monitoring & Analytics

Tawk.to provides analytics on:

- Chat volume by hour/day
- Average response time
- Customer satisfaction ratings
- Popular pages where chats start
- Agent performance

Access: **Reports** → **Chat Reports**

---

## 🚨 Troubleshooting

### Widget not appearing?

1. Check Property ID and Widget ID are correct
2. Clear browser cache
3. Make sure you're on allowed pages (/, /checkout, /reviews)
4. Check browser console for errors

### Widget showing on wrong pages?

Edit `allowedPages` array in `/src/app/core/services/tawk.service.ts`:

```typescript
private allowedPages = ['/', '/checkout', '/reviews'];
```

### Want to show on more pages?

Add pages to the array:

```typescript
private allowedPages = ['/', '/checkout', '/reviews', '/courses', '/about'];
```

### Visitor info not showing?

Make sure user is logged in - info is only sent for authenticated users

---

## 📊 Expected Usage

Based on your traffic:

- **Home Page**: Highest chat volume (new visitors)
- **Checkout**: Critical - quick response = higher conversions
- **Reviews**: Trust-building conversations

---

## 💡 Pro Tips

1. **Set business hours** in Tawk settings
2. **Enable email notifications** for missed chats
3. **Use tags** to categorize conversations (Sales, Support, Billing)
4. **Review chat history** to identify common questions → add to FAQ
5. **Train anyone who responds** to maintain consistent, professional tone

---

## 🎉 You're All Set!

Once you add your Property ID and Widget ID, your live chat is ready to go!

**Next Steps:**

1. Update the IDs in `tawk.service.ts`
2. Customize widget colors to match purple theme
3. Set your availability hours
4. Download mobile app
5. Test on all three pages (Home, Checkout, Reviews)

Happy chatting! 💬✨
