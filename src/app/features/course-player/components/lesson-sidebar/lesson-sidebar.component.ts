import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Module, Lesson } from '../../../../core/models/course.model';
import {
  ChevronRight,
  Check,
  Play,
  Clock,
  X,
  ClipboardList,
  FileText,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-lesson-sidebar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './lesson-sidebar.component.html',
  styleUrl: './lesson-sidebar.component.css',
})
export class LessonSidebarComponent implements OnChanges, AfterViewChecked {
  @Input() modules: Module[] = [];
  @Input() currentLessonId: string | null = null;
  @Input() expandedModules: Set<string> = new Set();
  @Input() isSidebarOpen: boolean = true;
  @Input() completedLessonIds: Set<string> = new Set();
  @Input() passedQuizModuleIds: Set<string> = new Set();
  @Input() isQuizActive: boolean = false;
  @Input() activeQuizModuleId: string | null = null;

  private shouldScrollToLesson = false;
  private previousLessonId: string | null = null;

  @Output() lessonSelected = new EventEmitter<{
    lesson: Lesson;
    module: Module;
  }>();
  @Output() moduleToggled = new EventEmitter<string>();
  @Output() sidebarClosed = new EventEmitter<void>();
  @Output() lessonCompleted = new EventEmitter<string>();
  @Output() quizSelected = new EventEmitter<Module>();

  // Icons
  ChevronRight = ChevronRight;
  Check = Check;
  Play = Play;
  Clock = Clock;
  X = X;
  ClipboardList = ClipboardList;
  FileText = FileText;

  constructor(private elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when currentLessonId changes
    if (changes['currentLessonId'] && !changes['currentLessonId'].firstChange) {
      const newLessonId = changes['currentLessonId'].currentValue;
      if (newLessonId !== this.previousLessonId) {
        this.previousLessonId = newLessonId;
        this.shouldScrollToLesson = true;

        // Ensure the module containing the current lesson is expanded
        this.ensureCurrentModuleExpanded();
      }
    }
  }

  ngAfterViewChecked(): void {
    // Scroll to the current lesson after view is updated
    if (this.shouldScrollToLesson && this.currentLessonId) {
      this.scrollToCurrentLesson();
      this.shouldScrollToLesson = false;
    }
  }

  private ensureCurrentModuleExpanded(): void {
    if (!this.currentLessonId) return;

    // Find the module that contains the current lesson
    const moduleWithLesson = this.modules.find((module) =>
      module.lessons.some((lesson) => lesson.id === this.currentLessonId)
    );

    if (moduleWithLesson && !this.expandedModules.has(moduleWithLesson.id)) {
      // Emit event to parent to expand this module
      this.moduleToggled.emit(moduleWithLesson.id);
    }
  }

  private scrollToCurrentLesson(): void {
    const lessonElement = this.elementRef.nativeElement.querySelector(
      `.lesson-item[data-lesson-id="${this.currentLessonId}"]`
    );

    if (lessonElement) {
      // Get the scrollable container
      const scrollContainer =
        this.elementRef.nativeElement.querySelector('.modules-list');

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        const lessonRect = lessonElement.getBoundingClientRect();

        // Calculate the position to scroll to (align lesson to top of sidebar)
        const scrollOffset = lessonRect.top - containerRect.top;

        scrollContainer.scrollBy({
          top: scrollOffset,
          behavior: 'smooth',
        });
      }
    }
  }

  onSelectLesson(lesson: Lesson, module: Module): void {
    this.lessonSelected.emit({ lesson, module });
  }

  onToggleModule(moduleId: string): void {
    this.moduleToggled.emit(moduleId);
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules.has(moduleId);
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessonIds.has(lessonId);
  }

  closeSidebar(): void {
    this.sidebarClosed.emit();
  }

  formatDuration(duration: number | string): string {
    // If already formatted as string, return it
    if (typeof duration === 'string') {
      return duration;
    }

    // Otherwise format from seconds
    const minutes = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  getModuleDuration(module: Module): string {
    // If module has pre-calculated duration, use it
    if (module.duration) {
      return module.duration;
    }

    // Otherwise calculate from lessons
    const totalSeconds = module.lessons.reduce((sum, lesson) => {
      // Handle both string and number durations
      if (typeof lesson.duration === 'number') {
        return sum + lesson.duration;
      }
      return sum; // Skip string durations in calculation
    }, 0);

    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes} min`;
  }

  getModuleCompletion(module: Module): string {
    const completedCount = module.lessons.filter((lesson) =>
      this.isLessonCompleted(lesson.id)
    ).length;
    const totalCount = module.lessons.length;
    return `${completedCount}/${totalCount}`;
  }

  isTextLesson(lesson: Lesson): boolean {
    return lesson.videoUrl === 'Text Lesson';
  }

  getLessonIcon(lesson: Lesson) {
    if (this.isLessonCompleted(lesson.id)) {
      return this.Check;
    }
    return this.isTextLesson(lesson) ? this.FileText : this.Play;
  }

  onMarkComplete(event: Event, lessonId: string): void {
    event.stopPropagation(); // Prevent lesson selection when clicking complete button
    this.lessonCompleted.emit(lessonId);
  }

  onSelectQuiz(module: Module): void {
    this.quizSelected.emit(module);
  }

  isQuizPassed(moduleId: string): boolean {
    return this.passedQuizModuleIds.has(moduleId);
  }

  isQuizActiveForModule(moduleId: string): boolean {
    return this.isQuizActive && this.activeQuizModuleId === moduleId;
  }
}
