import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { from } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

export const guestGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization, then check if authenticated
  return from(authService.waitForAuthInit()).pipe(
    switchMap(() => authService.currentUser$),
    take(1),
    map((user) => {
      if (!user) {
        // Not logged in, allow access to login/register
        return true;
      }
      // Already logged in, redirect to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};
