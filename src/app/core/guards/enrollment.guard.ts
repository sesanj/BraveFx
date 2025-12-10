import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EnrollmentService } from '../services/enrollment.service';
import { map, switchMap, take } from 'rxjs/operators';
import { from } from 'rxjs';

export const enrollmentGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const enrollmentService = inject(EnrollmentService);
  const router = inject(Router);

  const courseId = route.paramMap.get('id') || ''; // Get as string (UUID)

  // Wait for auth to initialize first!
  return from(authService.waitForAuthInit()).pipe(
    switchMap(() => authService.currentUser$),
    take(1),
    switchMap(async (user) => {
      if (!user) {
        // Not logged in - redirect to login
        router.navigate(['/login'], {
          queryParams: { returnUrl: route.url.join('/') },
        });
        return false;
      }

      // Check if user is enrolled in this course
      const isEnrolled = await enrollmentService.isEnrolledInCourse(
        user.id,
        courseId
      );

      if (!isEnrolled) {
        // Not enrolled - redirect to checkout
        router.navigate(['/checkout'], {
          queryParams: { course: courseId },
        });
        return false;
      }

      // Update last accessed time
      enrollmentService.updateLastAccessed(user.id, courseId);

      return true;
    })
  );
};
