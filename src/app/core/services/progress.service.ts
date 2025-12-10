import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { LessonProgress } from '../models/course.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  // Cache progress data in memory for performance
  private progressCache: Map<string, LessonProgress> = new Map();

  private progressSubject = new BehaviorSubject<Map<string, LessonProgress>>(
    new Map()
  );
  public progress$ = this.progressSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  /**
   * Get progress for a specific lesson
   */
  getLessonProgress(lessonId: string): Observable<LessonProgress | undefined> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return of(undefined);
    }

    // Check cache first
    if (this.progressCache.has(lessonId)) {
      return of(this.progressCache.get(lessonId));
    }

    // Fetch from database
    return from(
      this.supabase.client
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return undefined;

        const progress: LessonProgress = {
          userId: data.user_id,
          lessonId: data.lesson_id,
          lastPosition: data.last_position,
          progressPercentage: data.progress_percentage,
          completed: data.completed,
          lastUpdated: new Date(data.last_updated),
        };

        // Update cache
        this.progressCache.set(lessonId, progress);
        return progress;
      }),
      catchError((err) => {
        return of(undefined);
      })
    );
  }

  /**
   * Save or update lesson progress
   */
  saveProgress(
    progress: Omit<LessonProgress, 'lastUpdated'>
  ): Observable<void> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const progressData = {
      user_id: userId,
      lesson_id: progress.lessonId,
      last_position: progress.lastPosition,
      progress_percentage: progress.progressPercentage,
      completed: progress.completed,
      last_updated: new Date().toISOString(),
    };

    return from(
      this.supabase.client
        .from('lesson_progress')
        .upsert(progressData, { onConflict: 'user_id,lesson_id' })
    ).pipe(
      map(({ error }) => {
        if (error) throw error;

        // Update cache
        const fullProgress: LessonProgress = {
          ...progress,
          lastUpdated: new Date(),
        };
        this.progressCache.set(progress.lessonId, fullProgress);
        this.progressSubject.next(this.progressCache);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Load all progress for a course
   */
  loadCourseProgress(
    courseId: string
  ): Observable<Map<string, LessonProgress>> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return of(new Map());
    }

    return from(
      this.supabase.client
        .from('lesson_progress')
        .select(
          `
          *,
          lessons!inner(
            module_id,
            modules!inner(course_id)
          )
        `
        )
        .eq('user_id', userId)
        .eq('lessons.modules.course_id', courseId)
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return new Map();

        const progressMap = new Map<string, LessonProgress>();
        data.forEach((item: any) => {
          const progress: LessonProgress = {
            userId: item.user_id,
            lessonId: item.lesson_id,
            lastPosition: item.last_position,
            progressPercentage: item.progress_percentage,
            completed: item.completed,
            lastUpdated: new Date(item.last_updated),
          };
          progressMap.set(item.lesson_id, progress);
          this.progressCache.set(item.lesson_id, progress);
        });

        this.progressSubject.next(progressMap);
        return progressMap;
      }),
      catchError(() => of(new Map()))
    );
  }

  /**
   * Calculate course progress percentage
   */
  getCourseProgress(
    courseId: string,
    totalLessons: number
  ): Observable<number> {
    const userId = this.supabase.currentUser?.id;
    if (!userId || totalLessons === 0) {
      return of(0);
    }

    return from(
      this.supabase.client
        .from('lesson_progress')
        .select(
          `
          completed,
          lessons!inner(
            module_id,
            modules!inner(course_id)
          )
        `
        )
        .eq('user_id', userId)
        .eq('lessons.modules.course_id', courseId)
        .eq('completed', true)
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return 0;
        const completedCount = data.length;
        const percentage = (completedCount / totalLessons) * 100;
        return Math.round(percentage);
      }),
      catchError(() => of(0))
    );
  }

  /**
   * Save the last watched lesson and active quiz for a course
   */
  saveLastWatchedLesson(courseId: string, lessonId: string): Observable<void> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client.from('course_progress').upsert(
        {
          user_id: userId,
          course_id: courseId,
          last_watched_lesson_id: lessonId,
          active_quiz_module_id: null, // Clear active quiz
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id' }
      )
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the last watched lesson for a course
   */
  getLastWatchedLesson(courseId: string): Observable<string | null> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return of(null);
    }

    return from(
      this.supabase.client
        .from('course_progress')
        .select('last_watched_lesson_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return null;
        return data.last_watched_lesson_id || null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }

  /**
   * Save the active quiz for a course
   */
  saveActiveQuiz(courseId: string, moduleId: string): Observable<void> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client.from('course_progress').upsert(
        {
          user_id: userId,
          course_id: courseId,
          last_watched_lesson_id: null, // Clear last watched lesson
          active_quiz_module_id: moduleId,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'user_id,course_id' }
      )
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the active quiz for a course
   */
  getActiveQuiz(courseId: string): Observable<string | null> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return of(null);
    }

    return from(
      this.supabase.client
        .from('course_progress')
        .select('active_quiz_module_id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return null;
        return data.active_quiz_module_id || null;
      }),
      catchError((err) => {
        return of(null);
      })
    );
  }

  /**
   * Clear active quiz (when quiz is completed or skipped)
   */
  clearActiveQuiz(courseId: string): Observable<void> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    return from(
      this.supabase.client
        .from('course_progress')
        .update({ active_quiz_module_id: null })
        .eq('user_id', userId)
        .eq('course_id', courseId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get completed lesson IDs for a course
   */
  getCompletedLessonIds(courseId: string): Observable<Set<string>> {
    const userId = this.supabase.currentUser?.id;
    if (!userId) {
      return of(new Set<string>());
    }

    return from(
      this.supabase.client
        .from('lesson_progress')
        .select(
          `
          lesson_id,
          lessons!inner(
            module_id,
            modules!inner(course_id)
          )
        `
        )
        .eq('user_id', userId)
        .eq('lessons.modules.course_id', courseId)
        .eq('completed', true)
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) return new Set<string>();
        return new Set<string>(data.map((item: any) => item.lesson_id));
      }),
      catchError(() => of(new Set<string>()))
    );
  }
}
