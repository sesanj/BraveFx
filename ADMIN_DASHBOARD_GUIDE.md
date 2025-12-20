# Premium Admin Dashboard

## Overview

A premium, elite admin dashboard for managing your BraveFx course platform. Features a beautiful sidebar navigation with distinct sections for comprehensive course management.

## Structure

### Main Layout

- **Sidebar Navigation**: Fixed left sidebar with gradient background (280px width)
- **Main Content Area**: Dynamic content area that changes based on selected section

### Sections

#### 1. Overview (`/admin/overview`)

Dashboard with key metrics:

- Total Revenue (from payments)
- Total Students (enrolled users)
- Average Rating (from reviews)
- Conversion Rate
- Beautiful stat cards with icons and growth indicators

#### 2. Students (`/admin/students`)

Student management interface:

- View all enrolled students
- Search by email or user ID
- See enrollment dates
- Track student progress percentages
- View last active dates
- Clean table layout with search functionality

#### 3. Payments (`/admin/payments`)

Payment transaction management:

- View all payments with transaction IDs
- See total revenue badge
- Search by user ID or payment intent
- Transaction details (amount, status, date)
- Green success badges for completed payments

#### 4. Reviews (`/admin/reviews`)

Review moderation:

- View all course reviews
- See star ratings
- Read review comments
- Approve/Reject reviews (buttons prepared for future)
- Delete reviews
- Beautiful card layout

#### 5. Content (`/admin/content`)

Content management (placeholder):

- Course editing
- Module organization
- Lesson management
- Resource attachments
- Quiz questions
  _Coming soon_

#### 6. Coupons (`/admin/coupons`)

Coupon code management:

- View all coupons
- Create new coupons
- Set discount percentage
- Toggle active/inactive status
- Delete coupons
- Track redemption counts
- Grid card layout

#### 7. Email (`/admin/email`)

Email students (placeholder):

- Send emails to enrolled students
- Email templates
- Schedule announcements
- Track email metrics
  _Coming soon_

#### 8. Settings (`/admin/settings`)

Admin settings (placeholder):

- Account preferences
- Notification settings
- Security options
- Display preferences
  _Coming soon_

## Design Features

### Color Scheme

- **Primary Gradient**: #667eea → #764ba2 (Purple gradient)
- **Background**: #1a1a2e → #16213e (Dark gradient)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Orange)
- **Error**: #991b1b (Red)

### Navigation

- Active route highlighting with gradient background
- Smooth hover animations
- Icon + label format
- Responsive with translateX animations

### Cards & Tables

- White backgrounds with subtle shadows
- Hover effects (translateY lift)
- Border-radius: 1rem for modern look
- Clean typography with proper hierarchy

### Admin Footer

- Admin avatar with gradient background
- Name and role display
- Professional appearance

## Access Control

Protected by:

- `authGuard`: Ensures user is authenticated
- `adminGuard`: Ensures user has admin role

## Route Configuration

```typescript
/admin - Main admin layout
  ├── /admin/overview - Dashboard
  ├── /admin/students - Student management
  ├── /admin/payments - Payment tracking
  ├── /admin/reviews - Review moderation
  ├── /admin/content - Content management
  ├── /admin/coupons - Coupon management
  ├── /admin/email - Email students
  └── /admin/settings - Admin settings
```

## Services Used

- **EnrollmentService**: `getAllEnrollments()` - Fetch all student enrollments
- **PaymentService**: `getAllPayments()` - Fetch all payment transactions
- **ReviewService**: `getAllReviews()`, `updateReviewStatus()`, `deleteReview()`
- **CouponService**: `getAllCoupons()`, `createCoupon()`, `updateCouponStatus()`, `deleteCoupon()`

## Future Enhancements

1. Implement full content management system
2. Add email campaign functionality
3. Create admin settings panel
4. Add data export features
5. Implement advanced filtering and sorting
6. Add revenue analytics charts
7. Student progress tracking details
8. Bulk operations for reviews/students

## Notes

- All components use standalone Angular architecture
- Lucide Angular icons for consistent iconography
- Responsive design (primarily desktop-focused for admin)
- Clean separation of concerns
- Type-safe with TypeScript
