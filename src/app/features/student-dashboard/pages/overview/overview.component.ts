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
    coursesEnrolled: 3,
    coursesCompleted: 1,
    hoursLearned: 24,
    certificatesEarned: 1,
  };

  recentCourses: Course[] = [
    {
      id: '1',
      title: 'Forex Trading Fundamentals',
      instructor: 'BraveFx Academy',
      progress: 90,
      thumbnail: 'https://picsum.photos/seed/forex1/400/225',
      lastAccessed: '2 hours ago',
      nextLesson: 'Understanding Market Trends',
      totalLessons: 20,
      completedLessons: 18,
    },
    {
      id: '2',
      title: 'Technical Analysis Mastery',
      instructor: 'BraveFx Academy',
      progress: 45,
      thumbnail: 'https://picsum.photos/seed/forex2/400/225',
      lastAccessed: '1 day ago',
      nextLesson: 'Chart Patterns',
      totalLessons: 25,
      completedLessons: 11,
    },
  ];

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

  constructor(private router: Router, private authService: AuthService) {}

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
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }
}
