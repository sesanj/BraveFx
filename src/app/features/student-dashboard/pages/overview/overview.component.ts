import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { Course as CourseModel } from '../../../../core/models/course.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    StatsGridComponent,
    CourseCardComponent,
    ActivityListComponent,
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

  recentActivity: Activity[] = [
    {
      type: 'lesson',
      title: 'Completed: Understanding Candlestick Patterns',
      course: 'Technical Analysis Mastery',
      time: '2 hours ago',
    },
    {
      type: 'quiz',
      title: 'Passed Quiz: Forex Market Structure',
      course: 'Forex Trading Fundamentals',
      time: '1 day ago',
    },
    {
      type: 'certificate',
      title: 'Earned Certificate: Risk Management',
      course: 'Risk Management Strategies',
      time: '3 days ago',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private courseService: CourseService,
    private progressService: ProgressService
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
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (courses: CourseModel[]) => {
        // Show first 2 courses in overview
        const displayCourses = courses.slice(0, 2);

        // Load progress for each course
        const progressRequests = displayCourses.map((course) =>
          forkJoin({
            progress: this.progressService.getCourseProgress(
              course.id,
              course.totalLessons
            ),
            completedIds: this.progressService.getCompletedLessonIds(course.id),
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
                  course.thumbnail || 'https://picsum.photos/seed/forex/400/225',
                lastAccessed: 'Recently',
                nextLesson:
                  completedIds.size > 0 ? 'Continue Learning' : 'Start Learning',
                totalLessons: course.totalLessons,
                completedLessons: completedIds.size,
              };
            });

            // Calculate stats
            this.calculateStats(courses);
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
                course.thumbnail || 'https://picsum.photos/seed/forex/400/225',
              lastAccessed: 'Recently',
              nextLesson: 'Start Learning',
              totalLessons: course.totalLessons,
              completedLessons: 0,
            }));
          },
        });

        // Update stats
        this.stats.coursesEnrolled = courses.length;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      },
    });
  }

  calculateStats(courses: CourseModel[]): void {
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
      },
      error: (error) => {
        console.error('Error calculating stats:', error);
      },
    });
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }
}
