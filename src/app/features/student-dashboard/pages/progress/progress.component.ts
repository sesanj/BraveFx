import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
} from 'lucide-angular';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent {
  // Icons
  TrendingUp = TrendingUp;
  BookOpen = BookOpen;
  Target = Target;
  Calendar = Calendar;

  // Progress Tab Data
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
}
