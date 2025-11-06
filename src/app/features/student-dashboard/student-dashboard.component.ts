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
  BookOpen,
  Mail,
  ChevronDown,
  Send,
  FileText,
  Video,
  Download,
  User,
  Lock,
  Palette,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
  Clock,
  Target,
  Flame,
  Calendar,
  Award,
  Trophy,
  CheckCircle,
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
  BookOpen = BookOpen;
  Mail = Mail;
  ChevronDown = ChevronDown;
  Send = Send;
  FileText = FileText;
  Video = Video;
  Download = Download;
  User = User;
  Lock = Lock;
  Palette = Palette;
  Sun = Sun;
  Moon = Moon;
  Bell = Bell;
  AlertTriangle = AlertTriangle;
  Clock = Clock;
  Target = Target;
  Flame = Flame;
  Calendar = Calendar;
  Award = Award;
  Trophy = Trophy;
  CheckCircle = CheckCircle;

  // Community links - Update these with your actual social media URLs
  communityLinks = {
    discord: 'https://discord.gg/bravefx',
    youtube: 'https://youtube.com/@bravefx',
    instagram: 'https://instagram.com/bravefx',
  };

  // FAQ data
  activeFaq: number | null = null;
  faqs = [
    {
      question: 'How do I access my enrolled courses?',
      answer:
        'You can access all your enrolled courses from the "My Courses" tab in the dashboard. Click on any course card to continue learning from where you left off.',
    },
    {
      question: 'Can I download course materials for offline viewing?',
      answer:
        'Yes! Most courses include downloadable resources like PDFs, cheat sheets, and supplementary materials. Look for the download icon in the Resources panel while viewing course content.',
    },
    {
      question: 'How do I track my learning progress?',
      answer:
        'Your progress is automatically tracked as you complete lessons and quizzes. Visit the "Progress" tab to see detailed analytics, completion rates, and your learning history.',
    },
    {
      question: 'What happens if I fail a quiz?',
      answer:
        "Don't worry! You can retake quizzes as many times as needed. We recommend reviewing the lesson material before attempting again. Your highest score will be recorded.",
    },
    {
      question: 'How do I earn certificates?',
      answer:
        'Certificates are automatically awarded when you complete all lessons and pass all quizzes in a course with a minimum score of 70%. You can download your certificates from the course completion page.',
    },
    {
      question: 'Can I access courses on mobile devices?',
      answer:
        'Absolutely! Our platform is fully responsive and works seamlessly on smartphones and tablets. You can learn anywhere, anytime.',
    },
    {
      question: 'How long do I have access to a course?',
      answer:
        'Once you enroll in a course, you have lifetime access! Learn at your own pace without any time pressure.',
    },
    {
      question: 'Is there a refund policy?',
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course within 30 days of purchase, contact our support team for a full refund.",
    },
  ];

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

  // Progress Tab Data - Simple metrics from existing data
  overallProgress = 67;
  completedLessons = 35;
  totalLessons = 60;
  quizAverage = 85;
  completedQuizzes = 12;

  courseProgress = [
    {
      title: 'Forex Trading Fundamentals',
      completedLessons: 18,
      totalLessons: 20,
      completedQuizzes: 5,
      totalQuizzes: 5,
      progress: 90,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      title: 'Technical Analysis Mastery',
      completedLessons: 12,
      totalLessons: 25,
      completedQuizzes: 3,
      totalQuizzes: 6,
      progress: 48,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      title: 'Risk Management Strategies',
      completedLessons: 5,
      totalLessons: 15,
      completedQuizzes: 1,
      totalQuizzes: 4,
      progress: 33,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  ];

  quizPerformance = [
    {
      title: 'Currency Pairs & Market Structure',
      course: 'Forex Trading Fundamentals',
      score: 95,
      date: 'Nov 4, 2025',
      attempts: 1,
    },
    {
      title: 'Chart Patterns Recognition',
      course: 'Technical Analysis Mastery',
      score: 88,
      date: 'Nov 2, 2025',
      attempts: 2,
    },
    {
      title: 'Position Sizing Basics',
      course: 'Risk Management Strategies',
      score: 72,
      date: 'Oct 30, 2025',
      attempts: 1,
    },
    {
      title: 'Fibonacci Retracements',
      course: 'Technical Analysis Mastery',
      score: 91,
      date: 'Oct 28, 2025',
      attempts: 1,
    },
    {
      title: 'Support & Resistance Levels',
      course: 'Forex Trading Fundamentals',
      score: 85,
      date: 'Oct 25, 2025',
      attempts: 2,
    },
  ];

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

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}
