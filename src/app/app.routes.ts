import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { guestGuard } from './core/guards/guest.guard';
import { enrollmentGuard } from './core/guards/enrollment.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'reviews',
    loadComponent: () =>
      import('./features/reviews/reviews.component').then(
        (m) => m.ReviewsComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
    // No authGuard - allow guest checkout with account creation
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/overview/overview.component'
          ).then((m) => m.OverviewComponent),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/courses/courses.component'
          ).then((m) => m.CoursesComponent),
      },
      {
        path: 'progress',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/progress/progress.component'
          ).then((m) => m.ProgressComponent),
      },
      {
        path: 'resources',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/resources/resources.component'
          ).then((m) => m.ResourcesComponent),
      },
      {
        path: 'community',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/community/community.component'
          ).then((m) => m.CommunityComponent),
      },
      {
        path: 'support',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/support/support.component'
          ).then((m) => m.SupportComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            './features/student-dashboard/pages/settings/settings.component'
          ).then((m) => m.SettingsComponent),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [authGuard, adminGuard],
  },
  {
    path: 'course/:id',
    loadComponent: () =>
      import('./features/course-player/course-player.component').then(
        (m) => m.CoursePlayerComponent
      ),
    canActivate: [authGuard, enrollmentGuard], // Check both auth AND enrollment
  },
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/legal/terms/terms.component').then(
        (m) => m.TermsComponent
      ),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent
      ),
  },
  {
    path: 'refund-policy',
    loadComponent: () =>
      import('./features/legal/refund-policy/refund-policy.component').then(
        (m) => m.RefundPolicyComponent
      ),
  },
  {
    path: 'risk-disclosure',
    loadComponent: () =>
      import('./features/legal/risk-disclosure/risk-disclosure.component').then(
        (m) => m.RiskDisclosureComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
