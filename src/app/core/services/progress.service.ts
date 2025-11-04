import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LessonProgress } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  // Dummy progress data stored in memory
  private progressData: Map<string, LessonProgress> = new Map();

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
}
