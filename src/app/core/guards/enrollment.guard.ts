import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { EnrollmentService } from '../services/enrollment.service';
import { map, switchMap, take } from 'rxjs/operators';

export const enrollmentGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const enrollmentService = inject(EnrollmentService);
  const router = inject(Router);

  const courseId = route.paramMap.get('id') || ''; // Get as string (UUID)
  console.log('🔒 [EnrollmentGuard] Checking access to course:', courseId);

  return authService.currentUser$.pipe(
    take(1),
    switchMap(async (user) => {
      if (!user) {
        // Not logged in - redirect to login
        console.log(
          '⚠️ [EnrollmentGuard] No user found - redirecting to login'
        );
        router.navigate(['/login'], {
          queryParams: { returnUrl: route.url.join('/') },
        });
        return false;
      }

      console.log(
        '🔍 [EnrollmentGuard] Checking enrollment for user:',
        user.email
      );

      // Check if user is enrolled in this course
      const isEnrolled = await enrollmentService.isEnrolledInCourse(
        user.id,
        courseId
      );

      if (!isEnrolled) {
        // Not enrolled - redirect to checkout
        console.log(
          `❌ [EnrollmentGuard] User ${user.email} is NOT enrolled in course ${courseId} - redirecting to checkout`
        );
        router.navigate(['/checkout'], {
          queryParams: { course: courseId },
        });
        return false;
      }

      console.log(
        `✅ [EnrollmentGuard] User ${user.email} IS enrolled in course ${courseId} - access granted`
      );

      // Update last accessed time
      enrollmentService.updateLastAccessed(user.id, courseId);

      return true;
    })
  );
};
