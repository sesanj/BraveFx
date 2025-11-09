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
import { Course as CourseModel } from '../../../../core/models/course.model';

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
    private courseService: CourseService
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
        this.recentCourses = courses.slice(0, 2).map((course) => ({
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          progress: 0, // TODO: Calculate from lesson_progress
          thumbnail:
            course.thumbnail || 'https://picsum.photos/seed/forex/400/225',
          lastAccessed: 'Recently',
          nextLesson: 'Start Learning',
          totalLessons: course.totalLessons,
          completedLessons: 0,
        }));

        // Update stats
        this.stats.coursesEnrolled = courses.length;
        // TODO: Calculate other stats from database
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      },
    });
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }
}
