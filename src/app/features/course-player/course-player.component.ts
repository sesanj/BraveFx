import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BarChart3,
  Menu,
  X,
  Sun,
  Moon,
  User,
  Star,
  Download,
  FileText,
  Users,
  MessageSquare,
  Clock,
  BookOpen,
  Calendar,
  LucideAngularModule,
} from 'lucide-angular';
import { Course, Lesson, Module } from '../../core/models/course.model';
import { CourseService } from '../../core/services/course.service';
import { ProgressService } from '../../core/services/progress.service';
import { ThemeService } from '../../core/services/theme.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { LessonSidebarComponent } from './components/lesson-sidebar/lesson-sidebar.component';
import { QuizPlayerComponent } from './components/quiz-player/quiz-player.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { QuizService } from '../../core/services/quiz.service';
import { ModuleQuiz, QuizResult } from '../../core/models/quiz.model';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    VideoPlayerComponent,
    LessonSidebarComponent,
    QuizPlayerComponent,
    FooterComponent,
  ],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.css',
})
export class CoursePlayerComponent implements OnInit {
  // Icons
  BarChart3 = BarChart3;
  Menu = Menu;
  X = X;
  Sun = Sun;
  Moon = Moon;
  User = User;
  Star = Star;
  Download = Download;
  FileText = FileText;
  Users = Users;
  MessageSquare = MessageSquare;
  Clock = Clock;
  BookOpen = BookOpen;
  Calendar = Calendar;

  course: Course | null = null;
  currentLesson: Lesson | null = null;
  currentModule: Module | null = null;
  videoUrl: SafeResourceUrl | null = null;

  courseProgress: number = 0;
  lessonProgress: number = 0;

  isSidebarOpen = true;
  isUserMenuOpen = false;
  expandedModules: Set<string> = new Set();
  completedLessonIds: Set<string> = new Set();

  // Tab state
  activeTab: 'overview' | 'reviews' | 'resources' = 'overview';
  reviewRating: number = 0;
  reviewText: string = '';

  // Autoplay and loading state
  isLoadingVideo: boolean = false;
  shouldAutoplay: boolean = false;

  // Quiz state
  showQuiz: boolean = false;
  currentQuiz: ModuleQuiz | null = null;
  quizAttemptNumber: number = 1;
  passedQuizModuleIds: Set<string> = new Set();
  lastQuizResult: QuizResult | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService,
    private quizService: QuizService,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.loadProgress(courseId);
    }

    // Close sidebar by default on mobile
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  checkMobileView(): void {
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }

  loadCourse(courseId: string): void {
    this.courseService.getCourse(courseId).subscribe((course) => {
      this.course = course;

      // Load completed lessons
      this.loadCompletedLessons(course);

      // Load passed quizzes
      this.loadPassedQuizzes(course);

      // Try to load the last watched lesson
      this.progressService
        .getLastWatchedLesson(courseId)
        .subscribe((lastLessonId) => {
          let lessonToLoad: Lesson | null = null;
          let moduleToLoad: Module | null = null;

          // If there's a last watched lesson, find it
          if (lastLessonId) {
            for (const module of course.modules) {
              const lesson = module.lessons.find((l) => l.id === lastLessonId);
              if (lesson) {
                lessonToLoad = lesson;
                moduleToLoad = module;
                break;
              }
            }
          }

          // If no last watched lesson found, default to first lesson
          if (!lessonToLoad && course.modules.length > 0) {
            moduleToLoad = course.modules[0];
            if (moduleToLoad.lessons.length > 0) {
              lessonToLoad = moduleToLoad.lessons[0];
            }
          }

          // Load the lesson and expand its module (without autoplay on initial load)
          if (lessonToLoad && moduleToLoad) {
            this.expandedModules.add(moduleToLoad.id);
            this.selectLesson(lessonToLoad, moduleToLoad, false);
          }
        });
    });
  }

  loadProgress(courseId: string): void {
    this.progressService.getCourseProgress(courseId).subscribe((progress) => {
      this.courseProgress = progress;
    });
  }

  loadCompletedLessons(course: Course): void {
    // Load all completed lessons from progress data
    const allLessonIds = course.modules.flatMap((module) =>
      module.lessons.map((lesson) => lesson.id)
    );

    allLessonIds.forEach((lessonId) => {
      this.progressService.getLessonProgress(lessonId).subscribe((progress) => {
        if (progress && progress.completed) {
          this.completedLessonIds.add(lessonId);
        }
      });
    });
  }

  loadPassedQuizzes(course: Course): void {
    // Load all passed quizzes for modules that have quizzes
    course.modules.forEach((module) => {
      if (module.hasQuiz) {
        this.quizService
          .hasPassedQuiz(module.id, '1')
          .subscribe((hasPassed) => {
            if (hasPassed) {
              this.passedQuizModuleIds.add(module.id);
            }
          });
      }
    });
  }

  selectLesson(lesson: Lesson, module: Module, autoplay: boolean = true): void {
    // Don't reload if the same lesson is already playing (unless quiz is showing)
    if (
      !this.showQuiz &&
      this.currentLesson?.id === lesson.id &&
      this.currentModule?.id === module.id
    ) {
      return;
    }

    // Hide quiz if it's currently showing
    this.showQuiz = false;
    this.currentQuiz = null;
    this.lastQuizResult = null;

    this.currentLesson = lesson;
    this.currentModule = module;
    this.shouldAutoplay = autoplay;

    // Save this as the last watched lesson
    if (this.course) {
      this.progressService.saveLastWatchedLesson(this.course.id, lesson.id);
    }

    // Show loading state and delay video load by 1 second if autoplay
    if (autoplay) {
      this.isLoadingVideo = true;
      this.videoUrl = null;

      setTimeout(() => {
        this.loadVideoAndProgress(lesson);
      }, 1000);
    } else {
      // Load immediately without delay on initial page load
      this.loadVideoAndProgress(lesson);
    }
  }

  private loadVideoAndProgress(lesson: Lesson): void {
    // Load lesson progress
    this.progressService.getLessonProgress(lesson.id).subscribe((progress) => {
      this.lessonProgress = progress?.progressPercentage || 0;

      // Convert video URL to embedded format
      const embedUrl = this.getEmbedUrl(lesson.videoUrl, this.shouldAutoplay);
      this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
      this.isLoadingVideo = false;

      // Also update completed status
      if (progress && progress.completed) {
        this.completedLessonIds.add(lesson.id);
      }
    });
  }

  getEmbedUrl(url: string, autoplay: boolean = false): string {
    // Convert YouTube/Vimeo URLs to embed format with optional autoplay
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      const autoplayParam = autoplay ? '?autoplay=1&rel=0' : '?rel=0';
      return `https://www.youtube.com/embed/${videoId}${autoplayParam}`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      const autoplayParam = autoplay ? '?autoplay=1' : '';
      return `https://player.vimeo.com/video/${videoId}${autoplayParam}`;
    }
    return url;
  }

  toggleModule(moduleId: string): void {
    if (this.expandedModules.has(moduleId)) {
      this.expandedModules.delete(moduleId);
    } else {
      this.expandedModules.add(moduleId);
    }
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules.has(moduleId);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToNextLesson(): void {
    if (!this.course || !this.currentLesson || !this.currentModule) return;

    const currentModuleIndex = this.course.modules.findIndex(
      (m) => m.id === this.currentModule!.id
    );
    const currentLessonIndex = this.currentModule.lessons.findIndex(
      (l) => l.id === this.currentLesson!.id
    );

    // Check if there's a next lesson in current module
    if (currentLessonIndex < this.currentModule.lessons.length - 1) {
      this.selectLesson(
        this.currentModule.lessons[currentLessonIndex + 1],
        this.currentModule
      );
    }
    // Check if there's a next module
    else if (currentModuleIndex < this.course.modules.length - 1) {
      const nextModule = this.course.modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        this.expandedModules.add(nextModule.id);
        this.selectLesson(nextModule.lessons[0], nextModule);
      }
    }
  }

  goToPreviousLesson(): void {
    if (!this.course || !this.currentLesson || !this.currentModule) return;

    const currentModuleIndex = this.course.modules.findIndex(
      (m) => m.id === this.currentModule!.id
    );
    const currentLessonIndex = this.currentModule.lessons.findIndex(
      (l) => l.id === this.currentLesson!.id
    );

    // Check if there's a previous lesson in current module
    if (currentLessonIndex > 0) {
      this.selectLesson(
        this.currentModule.lessons[currentLessonIndex - 1],
        this.currentModule
      );
    }
    // Check if there's a previous module
    else if (currentModuleIndex > 0) {
      const prevModule = this.course.modules[currentModuleIndex - 1];
      if (prevModule.lessons.length > 0) {
        this.expandedModules.add(prevModule.id);
        this.selectLesson(
          prevModule.lessons[prevModule.lessons.length - 1],
          prevModule
        );
      }
    }
  }

  markAsComplete(): void {
    if (!this.currentLesson) return;

    this.progressService
      .saveProgress({
        userId: '1', // Get from auth service
        lessonId: this.currentLesson.id,
        lastPosition: 0,
        progressPercentage: 100,
        completed: true,
      })
      .subscribe(() => {
        this.lessonProgress = 100;
        this.completedLessonIds.add(this.currentLesson!.id);
        if (this.course) {
          this.loadProgress(this.course.id);
        }

        // Check if this is the last lesson in the module and module has quiz
        if (this.isLastLessonInModule() && this.currentModule?.hasQuiz) {
          this.loadModuleQuiz();
        } else if (this.canGoNext()) {
          // Automatically navigate to the next lesson
          this.goToNextLesson();
        }
      });
  }

  isLastLessonInModule(): boolean {
    if (!this.currentModule || !this.currentLesson) return false;
    const lastLesson =
      this.currentModule.lessons[this.currentModule.lessons.length - 1];
    return lastLesson.id === this.currentLesson.id;
  }

  loadModuleQuiz(moduleId?: string): void {
    const targetModuleId = moduleId || this.currentModule?.id;
    if (!targetModuleId) return;

    // Find the module
    const module = this.course?.modules.find((m) => m.id === targetModuleId);
    if (!module) return;

    this.quizService.getModuleQuiz(targetModuleId).subscribe((quiz) => {
      if (quiz) {
        this.currentQuiz = quiz;
        this.currentModule = module;

        // Check if user has already passed this quiz
        this.quizService
          .hasPassedQuiz(targetModuleId, '1')
          .subscribe((hasPassed) => {
            if (hasPassed) {
              // Get the last quiz result to display
              this.quizService
                .getUserAttempts(quiz.id, '1')
                .subscribe((attempts) => {
                  if (attempts.length > 0) {
                    const lastAttempt = attempts[attempts.length - 1];
                    this.lastQuizResult = {
                      score: lastAttempt.score,
                      passed: lastAttempt.passed,
                      correctAnswers: lastAttempt.correctAnswers,
                      totalQuestions: lastAttempt.totalQuestions,
                      attemptNumber: lastAttempt.attemptNumber,
                    };
                  }
                });
            } else {
              this.lastQuizResult = null;
            }

            this.showQuiz = true;

            // Get attempt number
            this.quizService
              .getUserAttempts(quiz.id, '1')
              .subscribe((attempts) => {
                this.quizAttemptNumber = attempts.length + 1;
              });
          });
      }
    });
  }

  onQuizCompleted(result: QuizResult): void {
    console.log('Quiz completed:', result);

    // Save quiz result
    if (this.currentQuiz && this.currentModule) {
      const attempt = {
        userId: '1', // TODO: Use actual user ID from auth service
        quizId: this.currentQuiz.id,
        moduleId: this.currentModule.id,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        passed: result.passed,
        attemptNumber: result.attemptNumber,
        answers: [], // TODO: Include actual answers
        completedAt: new Date().toISOString(),
      };

      this.quizService.saveQuizAttempt(attempt).subscribe(() => {
        console.log('Quiz attempt saved successfully');
      });
    }

    // If passed, add to passed quizzes set
    if (result.passed && this.currentModule) {
      this.passedQuizModuleIds.add(this.currentModule.id);
      this.lastQuizResult = result;
    }

    // Update course progress
    if (this.course) {
      this.loadProgress(this.course.id);
    }
  }

  onQuizRetake(): void {
    this.quizAttemptNumber++;
    this.lastQuizResult = null;
    // Quiz player component will reset itself
  }

  onQuizContinue(): void {
    this.showQuiz = false;
    this.currentQuiz = null;
    this.lastQuizResult = null;

    // After completing quiz, go to the first lesson of the next module
    if (this.course && this.currentModule) {
      const currentModuleIndex = this.course.modules.findIndex(
        (m) => m.id === this.currentModule!.id
      );

      // If there's a next module, go to its first lesson
      if (currentModuleIndex < this.course.modules.length - 1) {
        const nextModule = this.course.modules[currentModuleIndex + 1];
        if (nextModule.lessons.length > 0) {
          this.selectLesson(nextModule.lessons[0], nextModule);
        }
      }
    }
  }

  onQuizSelected(module: Module): void {
    // Clear current lesson selection when viewing quiz
    this.currentLesson = null;
    this.videoUrl = null;

    // Hide video player and show quiz
    this.loadModuleQuiz(module.id);

    // Auto-close sidebar on mobile after selecting a quiz
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }

  isLessonCompleted(lessonId: string): boolean {
    // Check from progress service (simplified for now)
    return this.lessonProgress === 100 && this.currentLesson?.id === lessonId;
  }

  goBackToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLessonSelected(event: { lesson: Lesson; module: Module }): void {
    this.selectLesson(event.lesson, event.module);

    // Auto-close sidebar on mobile after selecting a lesson
    if (window.innerWidth <= 768) {
      this.isSidebarOpen = false;
    }
  }

  onModuleToggled(moduleId: string): void {
    this.toggleModule(moduleId);
  }

  canGoPrevious(): boolean {
    if (!this.course || !this.currentLesson || !this.currentModule)
      return false;

    const currentModuleIndex = this.course.modules.findIndex(
      (m) => m.id === this.currentModule!.id
    );
    const currentLessonIndex = this.currentModule.lessons.findIndex(
      (l) => l.id === this.currentLesson!.id
    );

    return currentLessonIndex > 0 || currentModuleIndex > 0;
  }

  canGoNext(): boolean {
    if (!this.course || !this.currentLesson || !this.currentModule)
      return false;

    const currentModuleIndex = this.course.modules.findIndex(
      (m) => m.id === this.currentModule!.id
    );
    const currentLessonIndex = this.currentModule.lessons.findIndex(
      (l) => l.id === this.currentLesson!.id
    );

    return (
      currentLessonIndex < this.currentModule.lessons.length - 1 ||
      currentModuleIndex < this.course.modules.length - 1
    );
  }

  setActiveTab(tab: 'overview' | 'reviews' | 'resources'): void {
    this.activeTab = tab;
  }

  setRating(rating: number): void {
    this.reviewRating = rating;
  }

  submitReview(): void {
    if (this.reviewRating === 0 || !this.reviewText.trim()) {
      return;
    }

    // TODO: Implement review submission to backend
    console.log('Review submitted:', {
      courseId: this.course?.id,
      rating: this.reviewRating,
      text: this.reviewText,
    });

    // Reset form
    this.reviewRating = 0;
    this.reviewText = '';
  }

  formatCourseDuration(durationInMinutes: number): string {
    if (durationInMinutes < 60) {
      return `${durationInMinutes} mins`;
    }

    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const month = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    return `${month} ${year}`;
  }
}
