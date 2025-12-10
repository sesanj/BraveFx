import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  TrendingUp,
  BookOpen,
  Target,
  Calendar,
  RotateCw,
  CheckCircle,
  XCircle,
  BarChart3,
  X,
  Video,
} from 'lucide-angular';
import { CourseService } from '../../../../core/services/course.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { QuizService } from '../../../../core/services/quiz.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { forkJoin, from, Observable } from 'rxjs';
import { DashboardSkeletonComponent } from '../../../../shared/components/skeleton-loader/skeletons/dashboard-skeleton.component';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DashboardSkeletonComponent],
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
  CheckCircle = CheckCircle;
  XCircle = XCircle;
  BarChart3 = BarChart3;
  X = X;
  Video = Video;

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
    attemptId: string;
    quizId: string;
    moduleId: string;
    title: string;
    course: string;
    module: string;
    score: number;
    date: string;
    attempts: number;
  }> = [];

  // Quiz review modal state
  showQuizReview: boolean = false;
  selectedQuizAttempt: any = null;
  quizReviewData: any = null;
  loadingQuizReview: boolean = false;

  constructor(
    private courseService: CourseService,
    private progressService: ProgressService,
    private quizService: QuizService,
    private supabase: SupabaseService
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
            quizCount: this.getQuizCount(course.id), // Fetch quiz count from database
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
                completedQuizzes: 0, // Will be updated after loading quiz data
                totalQuizzes: result.quizCount,
                progress: Math.round(progress),
                color: colors[index % colors.length],
              };
            });

            this.overallProgress = Math.round(totalProgress / courses.length);
            this.completedLessons = totalCompleted;
            this.totalLessons = totalLessonsCount;

            // Load quiz performance data and update course progress
            this.loadQuizPerformance(courses);
          },
          error: (error) => {
            this.loading = false;
          },
        });
      },
      error: (error) => {
        this.loading = false;
      },
    });
  }

  private getQuizCount(courseId: string): Observable<number> {
    return from(this.fetchQuizCountFromSupabase(courseId));
  }

  private async fetchQuizCountFromSupabase(courseId: string): Promise<number> {
    const { count, error } = await this.supabase.client
      .from('modules')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .eq('has_quiz', true);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  loadQuizPerformance(courses: any[]): void {
    this.quizService.getAllUserAttempts().subscribe({
      next: (attempts) => {
        // Transform to match the component's expected format
        this.quizPerformance = attempts.map((attempt) => {
          return {
            attemptId: attempt.id || '',
            quizId: attempt.quizId,
            moduleId: attempt.moduleId,
            title: attempt.quizTitle || 'Quiz',
            course: attempt.courseName || 'Course',
            module: attempt.moduleName || 'Module',
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

        // Update course progress with completed quiz counts
        this.courseProgress = this.courseProgress.map((courseProgress) => {
          const course = courses.find((c) => c.title === courseProgress.title);
          if (course) {
            // Count passed quizzes for this course
            const passedQuizzes = attempts.filter(
              (attempt) => attempt.courseName === course.title && attempt.passed
            ).length;

            return {
              ...courseProgress,
              completedQuizzes: passedQuizzes,
            };
          }
          return courseProgress;
        });

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      },
    });
  }

  openQuizReview(quiz: any): void {
    this.selectedQuizAttempt = quiz;
    this.showQuizReview = true;
    this.loadingQuizReview = true;

    // Fetch the quiz attempt details with answers
    this.quizService.getQuizAttemptById(quiz.attemptId).subscribe({
      next: (attempt: any) => {
        if (!attempt) {
          this.closeQuizReview();
          return;
        }

        // Fetch the full quiz with questions and options
        this.quizService.getModuleQuiz(quiz.moduleId).subscribe({
          next: (fullQuiz) => {
            if (!fullQuiz) {
              this.closeQuizReview();
              return;
            }

            // Combine quiz questions with user answers
            this.quizReviewData = {
              title: quiz.title,
              score: quiz.score,
              passed: attempt.passed,
              correctAnswers: attempt.correctAnswers,
              totalQuestions: attempt.totalQuestions,
              questions: fullQuiz.questions.map((question) => {
                const userAnswer = attempt.answers.find(
                  (a: any) => a.questionId === question.id
                );
                const selectedOption = question.options.find(
                  (o) => o.id === userAnswer?.selectedOptionId
                );
                const correctOption = question.options.find((o) => o.isCorrect);

                // Determine if user's answer is correct by checking if selected option is the correct one
                const isCorrect = selectedOption?.isCorrect === true;

                return {
                  questionText: question.questionText,
                  options: question.options,
                  selectedOptionId: userAnswer?.selectedOptionId,
                  correctOptionId: correctOption?.id,
                  isCorrect: isCorrect,
                  selectedOption: selectedOption,
                  correctOption: correctOption,
                };
              }),
            };

            this.loadingQuizReview = false;
          },
          error: (error: any) => {
            this.closeQuizReview();
          },
        });
      },
      error: (error: any) => {
        this.closeQuizReview();
      },
    });
  }

  closeQuizReview(): void {
    this.showQuizReview = false;
    this.selectedQuizAttempt = null;
    this.quizReviewData = null;
    this.loadingQuizReview = false;
  }
}
