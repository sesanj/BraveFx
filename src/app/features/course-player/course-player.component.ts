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
  LucideAngularModule,
} from 'lucide-angular';
import { Course, Lesson, Module } from '../../core/models/course.model';
import { CourseService } from '../../core/services/course.service';
import { ProgressService } from '../../core/services/progress.service';
import { ThemeService } from '../../core/services/theme.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoPlayerComponent } from './components/video-player/video-player.component';
import { LessonSidebarComponent } from './components/lesson-sidebar/lesson-sidebar.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    VideoPlayerComponent,
    LessonSidebarComponent,
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourse(courseId);
      this.loadProgress(courseId);
    }
  }

  loadCourse(courseId: string): void {
    this.courseService.getCourse(courseId).subscribe((course) => {
      this.course = course;

      // Load completed lessons
      this.loadCompletedLessons(course);

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

  selectLesson(lesson: Lesson, module: Module, autoplay: boolean = true): void {
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

        // Automatically navigate to the next lesson
        if (this.canGoNext()) {
          this.goToNextLesson();
        }
      });
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
}
