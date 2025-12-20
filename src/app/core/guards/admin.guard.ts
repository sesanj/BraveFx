import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  await authService.waitForAuthInit();

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  console.log(
    'Admin guard failed - isAuthenticated:',
    authService.isAuthenticated(),
    'isAdmin:',
    authService.isAdmin()
  );
  router.navigate(['/']);
  return false;
};
