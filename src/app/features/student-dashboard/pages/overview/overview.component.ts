import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  StatsGridComponent,
  StatData,
} from '../../components/stats-grid/stats-grid.component';
import {
  CourseCardComponent,
  Course,
} from '../../components/course-card/course-card.component';
import {
  ActivityListComponent,
  Activity,
} from '../../components/activity-list/activity-list.component';
import { AuthService } from '../../../../core/services/auth.service';
import { CourseService } from '../../../../core/services/course.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { QuizService } from '../../../../core/services/quiz.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';
import { Course as CourseModel } from '../../../../core/models/course.model';
import { forkJoin, from } from 'rxjs';
import { take } from 'rxjs/operators';
import { LucideAngularModule, X } from 'lucide-angular';
import { DashboardSkeletonComponent } from '../../../../shared/components/skeleton-loader/skeletons/dashboard-skeleton.component';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatsGridComponent,
    CourseCardComponent,
    ActivityListComponent,
    LucideAngularModule,
    DashboardSkeletonComponent,
  ],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
})
export class OverviewComponent implements OnInit {
  user = {
    name: 'Loading...',
    email: '',
  };

  stats: StatData = {
    coursesEnrolled: 0,
    coursesCompleted: 0,
    hoursLearned: 0,
    certificatesEarned: 0,
  };

  recentCourses: Course[] = [];
  recentActivity: Activity[] = [];
  allActivities: Activity[] = [];
  showActivitiesModal = false;

  // Loading states
  isLoadingCourses = true;
  isLoadingActivities = true;
  isLoadingStats = true;

  // Icons
  X = X;

  constructor(
    private router: Router,
    private authService: AuthService,
    private courseService: CourseService,
    private progressService: ProgressService,
    private quizService: QuizService,
    private supabase: SupabaseService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe((currentUser) => {
      if (currentUser) {
        this.user = {
          name: currentUser.name,
          email: currentUser.email,
        };
      }
    });

    // Load courses from database
    this.loadCourses();

    // Load recent activities
    this.loadRecentActivities();
  }

  loadCourses(): void {
    this.isLoadingCourses = true;

    // Get current user from observable
    this.authService.currentUser$.pipe(take(1)).subscribe((currentUser) => {
      const userId = currentUser?.id;

      if (!userId) {
        console.error('No user ID found');
        this.isLoadingCourses = false;
        return;
      }

      // Get user's enrolled course IDs first
      this.enrollmentService
        .getUserCourseIds(userId)
        .then((enrolledCourseIds) => {
          console.log('🔍 [Overview] Enrolled Course IDs:', enrolledCourseIds);
          if (enrolledCourseIds.length === 0) {
            // User not enrolled in any courses
            console.log(
              '⚠️ [Overview] User not enrolled in any courses - showing empty state'
            );
            this.recentCourses = [];
            this.stats.coursesEnrolled = 0;
            this.isLoadingCourses = false;
            return;
          }

          // Load only enrolled courses
          this.courseService.getAllCourses().subscribe({
            next: (allCourses: CourseModel[]) => {
              console.log(
                '🔍 [Overview] All courses loaded:',
                allCourses.length
              );
              // Filter to only show enrolled courses (course.id is now UUID string)
              const enrolledCourses = allCourses.filter((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                console.log(
                  `🔍 [Overview] Course ${course.id} (${course.title}): isEnrolled=${isEnrolled}`
                );
                return isEnrolled;
              });

              console.log(
                '✅ [Overview] Filtered enrolled courses:',
                enrolledCourses.length
              );
              // Show first 2 enrolled courses in overview
              const displayCourses = enrolledCourses.slice(0, 2);

              // Load progress for each course
              const progressRequests = displayCourses.map((course) =>
                forkJoin({
                  progress: this.progressService.getCourseProgress(
                    course.id,
                    course.totalLessons
                  ),
                  completedIds: this.progressService.getCompletedLessonIds(
                    course.id
                  ),
                })
              );

              forkJoin(progressRequests).subscribe({
                next: (progressData) => {
                  this.recentCourses = displayCourses.map((course, index) => {
                    const { progress, completedIds } = progressData[index];
                    return {
                      id: course.id,
                      title: course.title,
                      instructor: course.instructor,
                      progress: progress,
                      thumbnail:
                        course.thumbnail ||
                        'https://picsum.photos/seed/forex/400/225',
                      lastAccessed: 'Recently',
                      nextLesson:
                        completedIds.size > 0
                          ? 'Continue Learning'
                          : 'Start Learning',
                      totalLessons: course.totalLessons,
                      completedLessons: completedIds.size,
                    };
                  });

                  // Calculate stats with enrolled courses
                  this.calculateStats(enrolledCourses);
                  this.isLoadingCourses = false;
                },
                error: (error) => {
                  console.error('Error loading progress:', error);
                  // Still show courses even if progress fails
                  this.recentCourses = displayCourses.map((course) => ({
                    id: course.id,
                    title: course.title,
                    instructor: course.instructor,
                    progress: 0,
                    thumbnail:
                      course.thumbnail ||
                      'https://picsum.photos/seed/forex/400/225',
                    lastAccessed: 'Recently',
                    nextLesson: 'Start Learning',
                    totalLessons: course.totalLessons,
                    completedLessons: 0,
                  }));
                  this.isLoadingCourses = false;
                },
              });

              // Update stats with enrolled courses count
              this.stats.coursesEnrolled = enrolledCourses.length;
            },
            error: (error) => {
              console.error('Error loading courses:', error);
              this.isLoadingCourses = false;
            },
          });
        });
    });
  }

  calculateStats(courses: CourseModel[]): void {
    this.isLoadingStats = true;
    // Calculate completed courses and hours learned
    const progressRequests = courses.map((course) =>
      this.progressService.getCourseProgress(course.id, course.totalLessons)
    );

    forkJoin(progressRequests).subscribe({
      next: (progressValues) => {
        // Count courses with 100% completion
        const completedCount = progressValues.filter((p) => p === 100).length;
        this.stats.coursesCompleted = completedCount;

        // Calculate total hours learned (approximate based on progress)
        const totalHours = courses.reduce((sum, course, index) => {
          const progress = progressValues[index] / 100;
          const courseHours = course.duration / 3600; // Convert seconds to hours
          return sum + courseHours * progress;
        }, 0);
        this.stats.hoursLearned = Math.round(totalHours);

        // Certificates earned = completed courses
        this.stats.certificatesEarned = completedCount;
        this.isLoadingStats = false;
      },
      error: (error) => {
        console.error('Error calculating stats:', error);
        this.isLoadingStats = false;
      },
    });
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }

  loadRecentActivities(): void {
    this.isLoadingActivities = true;
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      this.isLoadingActivities = false;
      return;
    }

    // Fetch completed lessons with course/module context and quiz attempts
    forkJoin({
      lessons: from(
        this.supabase.client
          .from('lesson_progress')
          .select(
            `
          *,
          lessons!inner(
            title,
            module_id,
            modules!inner(
              title,
              course_id,
              courses!inner(title)
            )
          )
        `
          )
          .eq('user_id', userId)
          .eq('completed', true)
          .order('last_updated', { ascending: false })
          .limit(50) // Increased to catch more for module completion detection
      ),
      quizzes: this.quizService.getAllUserAttempts(),
      modules: from(
        this.supabase.client.from('modules').select(
          `
          id,
          title,
          course_id,
          courses!inner(title),
          lessons(id)
        `
        )
      ),
    }).subscribe({
      next: ({ lessons, quizzes, modules }) => {
        const activities: Activity[] = [];
        const moduleCompletionMap = new Map<
          string,
          { completedAt: Date; moduleTitle: string; courseTitle: string }
        >();

        // Build module completion tracking
        if (lessons.data && modules.data) {
          const completedLessonsByModule = new Map<string, Set<string>>();
          const moduleLessonCounts = new Map<string, number>();

          // Count total lessons per module
          modules.data.forEach((module: any) => {
            moduleLessonCounts.set(module.id, module.lessons?.length || 0);
          });

          // Track completed lessons by module and find latest completion time
          const lessonProgressByModule = new Map<
            string,
            { lessonId: string; completedAt: Date }[]
          >();

          lessons.data.forEach((progress: any) => {
            const lesson = progress.lessons;
            const module = lesson?.modules;
            const moduleId = lesson?.module_id;

            if (!moduleId) return;

            if (!completedLessonsByModule.has(moduleId)) {
              completedLessonsByModule.set(moduleId, new Set());
              lessonProgressByModule.set(moduleId, []);
            }

            completedLessonsByModule.get(moduleId)!.add(progress.lesson_id);
            lessonProgressByModule.get(moduleId)!.push({
              lessonId: progress.lesson_id,
              completedAt: new Date(progress.last_updated),
            });

            // Add individual lesson completion
            activities.push({
              type: 'lesson',
              title: `Completed: ${lesson?.title || 'Lesson'}`,
              course: module?.courses?.title || 'Course',
              time: this.getRelativeTime(new Date(progress.last_updated)),
              timestamp: new Date(progress.last_updated),
            });
          });

          // Check for completed modules
          completedLessonsByModule.forEach((completedLessons, moduleId) => {
            const totalLessons = moduleLessonCounts.get(moduleId) || 0;
            if (totalLessons > 0 && completedLessons.size === totalLessons) {
              // Module is complete! Find the latest completion time
              const moduleLessons = lessonProgressByModule.get(moduleId) || [];
              const latestCompletion = moduleLessons.reduce(
                (latest, current) =>
                  current.completedAt > latest.completedAt ? current : latest,
                moduleLessons[0]
              );

              const moduleData = modules.data.find(
                (m: any) => m.id === moduleId
              );
              if (moduleData && latestCompletion) {
                // Handle courses which might be an array due to the join
                let courseTitle = 'Course';
                if (moduleData.courses) {
                  if (
                    Array.isArray(moduleData.courses) &&
                    moduleData.courses.length > 0
                  ) {
                    courseTitle = moduleData.courses[0].title;
                  } else if (
                    typeof moduleData.courses === 'object' &&
                    'title' in moduleData.courses
                  ) {
                    courseTitle = (moduleData.courses as any).title;
                  }
                }

                activities.push({
                  type: 'section',
                  title: `Completed Section: ${moduleData.title}`,
                  course: courseTitle,
                  time: this.getRelativeTime(latestCompletion.completedAt),
                  timestamp: latestCompletion.completedAt,
                });
              }
            }
          });
        }

        // Add quiz attempts
        quizzes.forEach((attempt) => {
          activities.push({
            type: 'quiz',
            title: attempt.passed
              ? `Passed: ${attempt.quizTitle}`
              : `Attempted: ${attempt.quizTitle}`,
            course: attempt.courseName || 'Course',
            time: this.getRelativeTime(new Date(attempt.completedAt)),
            timestamp: new Date(attempt.completedAt),
            passed: attempt.passed,
          });
        });

        // Sort by timestamp (most recent first)
        activities.sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );

        // Store all activities
        this.allActivities = activities;

        // Show top 5 for recent activity
        this.recentActivity = activities.slice(0, 5);
        this.isLoadingActivities = false;
      },
      error: (error) => {
        console.error('Error loading activities:', error);
        this.isLoadingActivities = false;
      },
    });
  }

  private async addSectionCompletions(activities: Activity[]): Promise<void> {
    // No longer needed - handled in loadRecentActivities
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60)
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffDays < 7)
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    }
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  openActivitiesModal(): void {
    this.showActivitiesModal = true;
  }

  closeActivitiesModal(): void {
    this.showActivitiesModal = false;
  }
}
