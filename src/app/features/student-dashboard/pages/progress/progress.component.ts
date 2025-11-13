import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
  RotateCw,
} from 'lucide-angular';
import { CourseService } from '../../../../core/services/course.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { QuizService } from '../../../../core/services/quiz.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit {
  // Icons
  TrendingUp = TrendingUp;
  BookOpen = BookOpen;
  Target = Target;
  Calendar = Calendar;
  RotateCw = RotateCw;

  // Progress Tab Data
  overallProgress = 0;
  completedLessons = 0;
  totalLessons = 0;
  quizAverage = 0;
  completedQuizzes = 0;
  loading = true;

  courseProgress: Array<{
    title: string;
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    progress: number;
    color: string;
  }> = [];

  quizPerformance: Array<{
    title: string;
    course: string;
    score: number;
    date: string;
    attempts: number;
  }> = [];

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService,
    private quizService: QuizService
  ) {}

  ngOnInit(): void {
    this.loadProgressData();
  }

  loadProgressData(): void {
    this.loading = true;

    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        if (courses.length === 0) {
          this.loading = false;
          return;
        }

        const colors = [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        ];

        const progressRequests = courses.map((course) =>
          forkJoin({
            progress: this.progressService.getCourseProgress(
              course.id,
              course.totalLessons || 0
            ),
            completedIds: this.progressService.getCompletedLessonIds(course.id),
          })
        );

        forkJoin(progressRequests).subscribe({
          next: (results) => {
            let totalProgress = 0;
            let totalCompleted = 0;
            let totalLessonsCount = 0;

            this.courseProgress = results.map((result, index) => {
              const course = courses[index];
              const progress = result.progress;
              const completedCount = result.completedIds.size;
              const totalLessons = course.totalLessons || 0;

              totalProgress += progress;
              totalCompleted += completedCount;
              totalLessonsCount += totalLessons;

              return {
                title: course.title,
                completedLessons: completedCount,
                totalLessons: totalLessons,
                completedQuizzes: 0,
                totalQuizzes:
                  course.modules?.filter((m: any) => m.type === 'quiz')
                    .length || 0,
                progress: Math.round(progress),
                color: colors[index % colors.length],
              };
            });

            this.overallProgress = Math.round(totalProgress / courses.length);
            this.completedLessons = totalCompleted;
            this.totalLessons = totalLessonsCount;

            // Load quiz performance data
            this.loadQuizPerformance();
          },
          error: (error) => {
            console.error('Error loading progress:', error);
            this.loading = false;
          },
        });
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.loading = false;
      },
    });
  }

  loadQuizPerformance(): void {
    this.quizService.getAllUserAttempts().subscribe({
      next: (attempts) => {
        // Transform to match the component's expected format
        this.quizPerformance = attempts.map((attempt) => {
          // Build course display string
          let courseDisplay = 'Course';
          if (attempt.courseName && attempt.moduleName) {
            courseDisplay = `${attempt.courseName} - ${attempt.moduleName}`;
          } else if (attempt.courseName) {
            courseDisplay = attempt.courseName;
          } else if (attempt.moduleName) {
            courseDisplay = attempt.moduleName;
          }

          return {
            title: attempt.quizTitle || 'Quiz',
            course: courseDisplay,
            score: attempt.score,
            date: new Date(attempt.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
            attempts: attempt.attemptNumber,
          };
        });

        // Calculate quiz statistics
        if (attempts.length > 0) {
          const totalScore = attempts.reduce(
            (sum, attempt) => sum + attempt.score,
            0
          );
          this.quizAverage = Math.round(totalScore / attempts.length);
          this.completedQuizzes = attempts.filter((a) => a.passed).length;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quiz performance:', error);
        this.loading = false;
      },
    });
  }
}
