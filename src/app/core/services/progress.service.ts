import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LessonProgress } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  // Dummy progress data stored in memory
  private progressData: Map<string, LessonProgress> = new Map();

  // Track last watched lesson for each course
  private lastWatchedLessons: Map<string, string> = new Map();

  private progressSubject = new BehaviorSubject<Map<string, LessonProgress>>(
    new Map()
  );
  public progress$ = this.progressSubject.asObservable();

  constructor() {
    // Initialize with some dummy progress
    this.progressData.set('l1', {
      userId: '1',
      lessonId: 'l1',
      lastPosition: 600,
      progressPercentage: 50,
      completed: false,
      lastUpdated: new Date(),
    });
    this.progressData.set('l2', {
      userId: '1',
      lessonId: 'l2',
      lastPosition: 1800,
      progressPercentage: 100,
      completed: true,
      lastUpdated: new Date(),
    });
    this.progressSubject.next(this.progressData);
  }

  getLessonProgress(lessonId: string): Observable<LessonProgress | undefined> {
    return of(this.progressData.get(lessonId));
  }

  saveProgress(
    progress: Omit<LessonProgress, 'lastUpdated'>
  ): Observable<void> {
    return new Observable((observer) => {
      // Simulate API delay
      setTimeout(() => {
        const fullProgress: LessonProgress = {
          ...progress,
          lastUpdated: new Date(),
        };
        this.progressData.set(progress.lessonId, fullProgress);
        this.progressSubject.next(this.progressData);
        observer.next();
        observer.complete();
      }, 500);
    });
  }

  getCourseProgress(courseId: string): Observable<number> {
    // Calculate overall course progress
    const allProgress = Array.from(this.progressData.values());
    const completedLessons = allProgress.filter((p) => p.completed).length;
    const totalLessons = 120; // From dummy course
    const percentage = (completedLessons / totalLessons) * 100;
    return of(Math.round(percentage));
  }

  // Save the last watched lesson for a course
  saveLastWatchedLesson(courseId: string, lessonId: string): void {
    this.lastWatchedLessons.set(courseId, lessonId);
    // In a real app, this would be saved to backend/localStorage
    localStorage.setItem(`lastWatchedLesson_${courseId}`, lessonId);
    // Clear active quiz when watching a lesson
    localStorage.removeItem(`activeQuiz_${courseId}`);
  }

  // Get the last watched lesson for a course
  getLastWatchedLesson(courseId: string): Observable<string | null> {
    // Check in-memory first
    let lastLessonId = this.lastWatchedLessons.get(courseId);

    // If not in memory, check localStorage
    if (!lastLessonId) {
      const storedId = localStorage.getItem(`lastWatchedLesson_${courseId}`);
      lastLessonId = storedId || undefined;
      if (lastLessonId) {
        this.lastWatchedLessons.set(courseId, lastLessonId);
      }
    }

    return of(lastLessonId || null);
  }

  // Save the active quiz for a course
  saveActiveQuiz(courseId: string, moduleId: string): void {
    localStorage.setItem(`activeQuiz_${courseId}`, moduleId);
    // Clear last watched lesson when viewing a quiz
    localStorage.removeItem(`lastWatchedLesson_${courseId}`);
    this.lastWatchedLessons.delete(courseId);
  }

  // Get the active quiz for a course
  getActiveQuiz(courseId: string): Observable<string | null> {
    const moduleId = localStorage.getItem(`activeQuiz_${courseId}`);
    return of(moduleId || null);
  }

  // Clear active quiz (when quiz is completed or skipped)
  clearActiveQuiz(courseId: string): void {
    localStorage.removeItem(`activeQuiz_${courseId}`);
  }
}
