import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  MessageCircle,
} from 'lucide-angular';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {
  TopBarComponent,
  UserData,
} from './components/top-bar/top-bar.component';
import {
  StatsGridComponent,
  StatData,
} from './components/stats-grid/stats-grid.component';
import {
  CourseCardComponent,
  Course,
} from './components/course-card/course-card.component';
import {
  ActivityListComponent,
  Activity,
} from './components/activity-list/activity-list.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    SidebarComponent,
    TopBarComponent,
    StatsGridComponent,
    CourseCardComponent,
    ActivityListComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  // Icons for coming soon tabs
  TrendingUp = TrendingUp;
  Users = Users;
  Settings = Settings;
  HelpCircle = HelpCircle;
  MessageCircle = MessageCircle;

  // Community links - Update these with your actual social media URLs
  communityLinks = {
    discord: 'https://discord.gg/bravefx',
    youtube: 'https://youtube.com/@bravefx',
    instagram: 'https://instagram.com/bravefx',
  };

  activeTab:
    | 'overview'
    | 'courses'
    | 'progress'
    | 'community'
    | 'settings'
    | 'support' = 'overview';

  // Mock user data
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    memberSince: 'January 2024',
  };

  // Mock stats data
  stats = {
    coursesEnrolled: 3,
    coursesCompleted: 1,
    hoursLearned: 24,
    certificatesEarned: 1,
  };

  // Mock courses data
  enrolledCourses = [
    {
      id: '1',
      title: 'Complete Forex Trading Masterclass',
      instructor: 'BraveFx Academy',
      progress: 45,
      thumbnail: 'https://picsum.photos/seed/forex1/400/225',
      lastAccessed: '2 hours ago',
      nextLesson: 'Understanding Market Trends',
      totalLessons: 120,
      completedLessons: 54,
    },
    {
      id: '2',
      title: 'Advanced Technical Analysis',
      instructor: 'BraveFx Academy',
      progress: 20,
      thumbnail: 'https://picsum.photos/seed/forex2/400/225',
      lastAccessed: '1 day ago',
      nextLesson: 'Fibonacci Retracements',
      totalLessons: 80,
      completedLessons: 16,
    },
    {
      id: '3',
      title: 'Risk Management Strategies',
      instructor: 'BraveFx Academy',
      progress: 100,
      thumbnail: 'https://picsum.photos/seed/forex3/400/225',
      lastAccessed: '3 days ago',
      nextLesson: 'Course Completed',
      totalLessons: 50,
      completedLessons: 50,
    },
  ];

  // Recent activity
  recentActivity: Activity[] = [
    {
      type: 'lesson',
      title: 'Completed: Understanding Support and Resistance',
      time: '2 hours ago',
      course: 'Complete Forex Trading Masterclass',
    },
    {
      type: 'quiz',
      title: 'Passed Quiz: Module 3 Assessment',
      time: '1 day ago',
      course: 'Complete Forex Trading Masterclass',
    },
    {
      type: 'certificate',
      title: 'Earned Certificate: Risk Management Strategies',
      time: '3 days ago',
      course: 'Risk Management Strategies',
    },
  ];

  constructor(private router: Router, public themeService: ThemeService) {}

  ngOnInit(): void {}

  onTabChange(
    tab:
      | 'overview'
      | 'courses'
      | 'progress'
      | 'community'
      | 'settings'
      | 'support'
  ): void {
    this.activeTab = tab;
  }

  onSettingsClick(): void {
    this.activeTab = 'settings';
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }
}
