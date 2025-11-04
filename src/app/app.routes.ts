import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'glossary',
    loadComponent: () =>
      import('./features/glossary/glossary.component').then(
        (m) => m.GlossaryComponent
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
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
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
    canActivate: [authGuard],
  },
];
