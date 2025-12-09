# Support Email Setup Guide

## ✅ What's Been Implemented

### 1. **Contact Form with Smart Features**

- ✅ Auto-populated name and email from logged-in user
- ✅ Category dropdown with 8 options including "Request A Refund"
- ✅ "Other" category reveals custom subject field
- ✅ Client-side validation (required fields, email format)
- ✅ Success/error messaging
- ✅ Form auto-resets after successful submission
- ✅ Responsive design for mobile

### 2. **Supabase Edge Function**

- ✅ Created `send-support-email` function
- ✅ Deployed to your Supabase project
- ✅ Integrated with Resend API
- ✅ Beautiful HTML email template
- ✅ Reply-to set to user's email for easy responses

### 3. **Subject Categories**

1. 🎓 Course Content Question
2. 💳 Billing & Payments
3. 💰 Request A Refund
4. 🔐 Account & Login Issues
5. 🐛 Technical Problem
6. 💡 Feature Request
7. 📚 General Question
8. ➕ Other (shows custom subject field)

---

## 🔧 Required Setup Steps

### Step 1: Add Resend API Key to Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Add a new secret:
   - **Name:** `RESEND_API_KEY`
   - **Value:** Your Resend API key

Or use the CLI:

```bash
supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
```

### Step 2: Update Email Addresses

Edit `/supabase/functions/send-support-email/index.ts` and update these lines:

**Line 48:** Update the "from" address (must be a verified domain in Resend)

```typescript
from: 'BraveFx Support <support@yourdomain.com>', // Update this
```

**Line 49:** Update where support emails should be sent

```typescript
to: ['your-actual-support-email@gmail.com'], // Update this
```

### Step 3: Verify Domain in Resend (if needed)

If you want to use a custom domain for the "from" address:

1. Go to your **Resend Dashboard**
2. Navigate to **Domains**
3. Add your domain (e.g., `bravefx.com`)
4. Add the DNS records they provide
5. Wait for verification

Or use Resend's shared domain:

```typescript
from: 'BraveFx Support <onboarding@resend.dev>',
```

### Step 4: Redeploy the Function

After updating the email addresses:

```bash
supabase functions deploy send-support-email
```

---

## 🧪 Testing

### Test in Development:

1. Navigate to the Support page in your app
2. Fill out the contact form
3. Submit
4. Check your email inbox for the support request

### Test Categories:

Try each category to ensure they work:

- Select "Course Content Question" → Subject auto-filled
- Select "Other" → Custom subject field appears
- Submit with empty fields → Validation errors
- Submit complete form → Success message

---

## 📧 Email Format

Support emails will arrive formatted like this:

**Subject:** `[Category] Subject`

- Example: `[Request A Refund] Unhappy with course quality`
- Example: `[Technical Problem] Cannot access video lessons`

**Body includes:**

- Student name
- Student email
- Category
- Subject
- Message
- Reply-to is set to student's email

---

## 🎨 How It Works

### User Flow:

1. User navigates to Dashboard → Support
2. Form auto-fills with their name and email
3. User selects category from dropdown
4. If "Other" selected, custom subject field appears
5. User writes message
6. Clicks "Send Message"
7. Edge Function sends email via Resend
8. Success message shows for 5 seconds
9. Form resets (keeps name/email)

### Technical Flow:

```
User Submit → Angular validates → Call Edge Function →
Resend API → Email sent → Success/Error message
```

---

## 🔒 Security Features

- ✅ API keys stored server-side (not exposed to client)
- ✅ Email validation on both client and server
- ✅ CORS headers properly configured
- ✅ Input sanitization
- ✅ Rate limiting via Supabase Edge Functions

---

## 🚀 Next Steps (Optional Enhancements)

### Recommended:

- [ ] Set up email auto-reply confirming ticket receipt
- [ ] Create support ticket tracking in database
- [ ] Add file attachment capability
- [ ] Set up email notifications for high-priority issues

### Nice to Have:

- [ ] Support chat integration
- [ ] Ticket status tracking for users
- [ ] Support analytics dashboard
- [ ] Auto-categorization using AI

---

## 🐛 Troubleshooting

### "Failed to send message" error:

- Check that `RESEND_API_KEY` is set in Supabase secrets
- Verify your Resend API key is valid
- Check Supabase Function logs for detailed errors
- Ensure the "from" email is verified in Resend

### Form not submitting:

- Check browser console for errors
- Verify all required fields are filled
- Check that user is logged in (name/email auto-fill)

### Emails not arriving:

- Check spam folder
- Verify "to" email address in Edge Function
- Check Resend dashboard for send logs
- Verify domain is verified in Resend

---

## 📝 Files Modified

1. `/src/app/features/student-dashboard/pages/support/support.component.ts`

   - Added FormsModule
   - Added form handling logic
   - Added category dropdown logic
   - Added validation

2. `/src/app/features/student-dashboard/pages/support/support.component.html`

   - Two-column form layout
   - Category dropdown
   - Conditional "Other" subject field
   - Success/error messages

3. `/src/app/features/student-dashboard/pages/support/support.component.css`

   - Form row grid layout
   - Success/error message styles
   - Select dropdown styles
   - Disabled button styles

4. `/supabase/functions/send-support-email/index.ts`

   - New Edge Function for email sending
   - Resend integration
   - HTML email template
   - Error handling

5. `/supabase/functions/_shared/cors.ts`
   - CORS headers for Edge Functions

---

**Ready to test!** Just complete the setup steps above and your support form will be fully functional! 🎉
