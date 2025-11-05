import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ModuleQuiz, QuizAttempt, QuizResult } from '../models/quiz.model';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  // Mock storage for passed quizzes and attempts (will be replaced with Supabase)
  private passedQuizzes: Map<string, QuizResult> = new Map(); // moduleId -> QuizResult
  private quizAttempts: Map<string, QuizAttempt[]> = new Map(); // quizId -> attempts[]

  constructor() {}

  /**
   * Get quiz for a specific module
   * TODO: Replace with actual Supabase call
   */
  getModuleQuiz(moduleId: string): Observable<ModuleQuiz | null> {
    // Mock data for now - will be replaced with Supabase
    const mockQuiz: ModuleQuiz = {
      id: 'quiz-1',
      moduleId: moduleId,
      title: 'Module Assessment',
      description:
        'Test your understanding of the concepts covered in this module',
      passingScore: 70,
      questions: [
        {
          id: 'q1',
          quizId: 'quiz-1',
          questionText:
            'What is the primary purpose of risk management in forex trading?',
          order: 1,
          options: [
            {
              id: 'q1-opt1',
              questionId: 'q1',
              optionText: 'To maximize profits regardless of risk',
              isCorrect: false,
              order: 1,
            },
            {
              id: 'q1-opt2',
              questionId: 'q1',
              optionText: 'To protect your trading capital and minimize losses',
              isCorrect: true,
              order: 2,
            },
            {
              id: 'q1-opt3',
              questionId: 'q1',
              optionText: 'To eliminate all trading risks',
              isCorrect: false,
              order: 3,
            },
            {
              id: 'q1-opt4',
              questionId: 'q1',
              optionText: 'To increase the number of trades',
              isCorrect: false,
              order: 4,
            },
          ],
        },
        {
          id: 'q2',
          quizId: 'quiz-1',
          questionText: 'What does a pip represent in forex trading?',
          order: 2,
          options: [
            {
              id: 'q2-opt1',
              questionId: 'q2',
              optionText: 'The smallest price movement in a currency pair',
              isCorrect: true,
              order: 1,
            },
            {
              id: 'q2-opt2',
              questionId: 'q2',
              optionText: 'A type of trading strategy',
              isCorrect: false,
              order: 2,
            },
            {
              id: 'q2-opt3',
              questionId: 'q2',
              optionText: 'The profit from a trade',
              isCorrect: false,
              order: 3,
            },
            {
              id: 'q2-opt4',
              questionId: 'q2',
              optionText: 'A currency pair',
              isCorrect: false,
              order: 4,
            },
          ],
        },
        {
          id: 'q3',
          quizId: 'quiz-1',
          questionText: 'Which of the following is a major currency pair?',
          order: 3,
          options: [
            {
              id: 'q3-opt1',
              questionId: 'q3',
              optionText: 'USD/ZAR',
              isCorrect: false,
              order: 1,
            },
            {
              id: 'q3-opt2',
              questionId: 'q3',
              optionText: 'EUR/USD',
              isCorrect: true,
              order: 2,
            },
            {
              id: 'q3-opt3',
              questionId: 'q3',
              optionText: 'GBP/TRY',
              isCorrect: false,
              order: 3,
            },
            {
              id: 'q3-opt4',
              questionId: 'q3',
              optionText: 'AUD/NZD',
              isCorrect: false,
              order: 4,
            },
          ],
        },
      ],
    };

    return of(mockQuiz);
  }

  /**
   * Get user's previous attempts for a quiz
   * TODO: Replace with actual Supabase call
   */
  getUserAttempts(quizId: string, userId: string): Observable<QuizAttempt[]> {
    // Mock - will be replaced with Supabase
    const attempts = this.quizAttempts.get(quizId) || [];
    return of(attempts);
  }

  /**
   * Save quiz attempt
   * TODO: Replace with actual Supabase call
   */
  saveQuizAttempt(attempt: QuizAttempt): Observable<QuizAttempt> {
    console.log('Quiz attempt saved:', attempt);

    // Mock storage - will be replaced with Supabase
    const savedAttempt = { ...attempt, id: 'attempt-' + Date.now() };
    const attempts = this.quizAttempts.get(attempt.quizId) || [];
    attempts.push(savedAttempt);
    this.quizAttempts.set(attempt.quizId, attempts);

    // Store passed quiz result
    if (attempt.passed) {
      const result: QuizResult = {
        score: attempt.score,
        passed: attempt.passed,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        attemptNumber: attempt.attemptNumber,
      };
      this.passedQuizzes.set(attempt.moduleId, result);
    }

    return of(savedAttempt);
  }

  /**
   * Check if user has passed the module quiz
   * TODO: Replace with actual Supabase call
   */
  hasPassedQuiz(moduleId: string, userId: string): Observable<boolean> {
    // Mock - will be replaced with Supabase
    const hasPassed = this.passedQuizzes.has(moduleId);
    return of(hasPassed);
  }

  /**
   * Get passed quiz result for a module
   * TODO: Replace with actual Supabase call
   */
  getPassedQuizResult(
    moduleId: string,
    userId: string
  ): Observable<QuizResult | null> {
    const result = this.passedQuizzes.get(moduleId) || null;
    return of(result);
  }
}
