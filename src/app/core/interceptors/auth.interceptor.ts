import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const user = authService.getCurrentUser();

  if (user) {
    // Clone request and add authorization header
    // This will be used when connecting to Supabase later
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer dummy-token-${user.id}`,
      },
    });
    return next(cloned);
  }

  return next(req);
};
