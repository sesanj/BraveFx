import { Injectable } from '@angular/core';
import { Observable, of, from, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import {
  ModuleQuiz,
  QuizAttempt,
  QuizResult,
  QuizQuestion,
  QuizOption,
} from '../models/quiz.model';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  constructor(
    private supabase: SupabaseService,
    private authService: AuthService
  ) {}

  /**
   * Get quiz for a specific module from Supabase
   */
  getModuleQuiz(moduleId: string): Observable<ModuleQuiz | null> {
    // First get the quiz ID for this module
    return from(
      this.supabase.client
        .from('quizzes')
        .select('id')
        .eq('module_id', moduleId)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching quiz:', error);
          throw error;
        }
        return data;
      }),
      // If we found a quiz, fetch its full details with questions
      map((quizData) => {
        if (!quizData) return null;
        return this.getQuizWithQuestions(quizData.id);
      }),
      // Flatten the nested observable
      switchMap((obs) => obs || of(null)),
      catchError((error) => {
        console.error('Error in getModuleQuiz:', error);
        return of(null);
      })
    );
  }

  /**
   * Get quiz with questions and options
   */
  getQuizWithQuestions(quizId: string): Observable<ModuleQuiz | null> {
    return from(
      Promise.all([
        // Get quiz details
        this.supabase.client
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single(),
        // Get questions with options
        this.supabase.client
          .from('quiz_questions')
          .select(
            `
            id,
            quiz_id,
            question,
            order_index,
            quiz_options (
              id,
              question_id,
              option_text,
              is_correct
            )
          `
          )
          .eq('quiz_id', quizId)
          .order('order_index', { ascending: true }),
      ])
    ).pipe(
      map(([quizResult, questionsResult]) => {
        if (quizResult.error || questionsResult.error) {
          console.error(
            'Error fetching quiz data:',
            quizResult.error || questionsResult.error
          );
          return null;
        }

        const quizData = quizResult.data;
        const questionsData = questionsResult.data;

        if (!quizData || !questionsData) return null;

        // Transform to ModuleQuiz format
        const quiz: ModuleQuiz = {
          id: quizData.id,
          moduleId: quizData.module_id,
          title: quizData.title,
          description:
            quizData.description ||
            'Test your knowledge. Pass with ' +
              quizData.passing_score +
              '% or higher.',
          passingScore: quizData.passing_score,
          questions: questionsData.map((q: any) => ({
            id: q.id,
            quizId: q.quiz_id,
            questionText: q.question,
            order: q.order_index,
            options: (q.quiz_options || []).map(
              (opt: any, optIndex: number) => ({
                id: opt.id,
                questionId: opt.question_id,
                optionText: opt.option_text,
                isCorrect: opt.is_correct,
                order: optIndex + 1,
              })
            ),
          })),
          createdAt: new Date(quizData.created_at),
        };

        return quiz;
      }),
      catchError((error) => {
        console.error('Error in getQuizWithQuestions:', error);
        return of(null);
      })
    );
  }

  /**
   * Get user's previous attempts for a quiz from Supabase
   */
  getUserAttempts(quizId: string, userId?: string): Observable<QuizAttempt[]> {
    const user = this.authService.getCurrentUser();
    const effectiveUserId = userId || user?.id;

    if (!effectiveUserId) {
      return of([]);
    }

    return from(
      this.supabase.client
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('user_id', effectiveUserId)
        .order('completed_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching quiz attempts:', error);
          return [];
        }

        return (data || []).map((attempt: any) => ({
          id: attempt.id,
          userId: attempt.user_id,
          quizId: attempt.quiz_id,
          moduleId: attempt.module_id,
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          correctAnswers: attempt.correct_answers,
          passed: attempt.passed,
          attemptNumber: attempt.attempt_number,
          completedAt: attempt.completed_at,
          answers: [], // We're not storing individual answers yet
        }));
      }),
      catchError((error) => {
        console.error('Error in getUserAttempts:', error);
        return of([]);
      })
    );
  }

  /**
   * Save quiz attempt to Supabase
   */
  saveQuizAttempt(attempt: QuizAttempt): Observable<QuizAttempt> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      console.error('No user logged in');
      return throwError(() => new Error('User not authenticated'));
    }

    const attemptData = {
      user_id: user.id,
      quiz_id: attempt.quizId,
      module_id: attempt.moduleId,
      score: attempt.score,
      total_questions: attempt.totalQuestions,
      correct_answers: attempt.correctAnswers,
      passed: attempt.passed,
      attempt_number: attempt.attemptNumber,
      completed_at: new Date().toISOString(),
    };

    return from(
      this.supabase.client
        .from('quiz_attempts')
        .insert(attemptData)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error saving quiz attempt:', error);
          throw error;
        }

        return {
          id: data.id,
          userId: data.user_id,
          quizId: data.quiz_id,
          moduleId: data.module_id,
          score: data.score,
          totalQuestions: data.total_questions,
          correctAnswers: data.correct_answers,
          passed: data.passed,
          attemptNumber: data.attempt_number,
          completedAt: data.completed_at,
          answers: attempt.answers,
        };
      }),
      catchError((error) => {
        console.error('Error in saveQuizAttempt:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user has passed the module quiz
   */
  hasPassedQuiz(moduleId: string, userId?: string): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    const effectiveUserId = userId || user?.id;

    if (!effectiveUserId) {
      return of(false);
    }

    return from(
      this.supabase.client
        .from('quiz_attempts')
        .select('passed')
        .eq('module_id', moduleId)
        .eq('user_id', effectiveUserId)
        .eq('passed', true)
        .limit(1)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error checking if quiz passed:', error);
          return false;
        }
        return (data && data.length > 0) || false;
      }),
      catchError((error) => {
        console.error('Error in hasPassedQuiz:', error);
        return of(false);
      })
    );
  }

  /**
   * Get passed quiz result for a module
   */
  getPassedQuizResult(
    moduleId: string,
    userId?: string
  ): Observable<QuizResult | null> {
    const user = this.authService.getCurrentUser();
    const effectiveUserId = userId || user?.id;

    if (!effectiveUserId) {
      return of(null);
    }

    return from(
      this.supabase.client
        .from('quiz_attempts')
        .select('*')
        .eq('module_id', moduleId)
        .eq('user_id', effectiveUserId)
        .eq('passed', true)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching passed quiz result:', error);
          return null;
        }

        if (!data) return null;

        return {
          score: data.score,
          passed: data.passed,
          correctAnswers: data.correct_answers,
          totalQuestions: data.total_questions,
          attemptNumber: data.attempt_number,
        };
      }),
      catchError((error) => {
        console.error('Error in getPassedQuizResult:', error);
        return of(null);
      })
    );
  }

  /**
   * Get all quiz attempts for the current user across all quizzes
   * Includes course and module information for display
   */
  getAllUserAttempts(): Observable<QuizAttempt[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return of([]);
    }

    return from(
      this.supabase.client
        .from('quiz_attempts')
        .select(
          `
          *,
          quizzes!inner(
            title,
            module_id,
            modules!inner(
              title,
              course_id,
              courses!inner(title)
            )
          )
        `
        )
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching all quiz attempts:', error);
          return [];
        }

        return (data || []).map((attempt: any) => ({
          id: attempt.id,
          userId: attempt.user_id,
          quizId: attempt.quiz_id,
          moduleId: attempt.module_id,
          score: attempt.score,
          totalQuestions: attempt.total_questions,
          correctAnswers: attempt.correct_answers,
          passed: attempt.passed,
          attemptNumber: attempt.attempt_number,
          completedAt: attempt.completed_at,
          answers: [],
          quizTitle: attempt.quizzes?.title || 'Quiz',
          moduleName: attempt.quizzes?.modules?.title,
          courseName: attempt.quizzes?.modules?.courses?.title,
        }));
      }),
      catchError((error) => {
        console.error('Error in getAllUserAttempts:', error);
        return of([]);
      })
    );
  }
}
