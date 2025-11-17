import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  LucideAngularModule,
} from 'lucide-angular';
import {
  ModuleQuiz,
  QuizQuestion,
  QuizAnswer,
  QuizResult,
} from '../../../../core/models/quiz.model';

@Component({
  selector: 'app-quiz-player',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './quiz-player.component.html',
  styleUrl: './quiz-player.component.css',
})
export class QuizPlayerComponent implements OnInit {
  @Input() quiz!: ModuleQuiz;
  @Input() attemptNumber: number = 1;
  @Input() previousResult: QuizResult | null = null;
  @Output() completed = new EventEmitter<QuizResult>();
  @Output() retake = new EventEmitter<void>();
  @Output() continue = new EventEmitter<void>();
  @Output() skip = new EventEmitter<void>();

  // Icons
  CheckCircle = CheckCircle;
  XCircle = XCircle;
  ChevronRight = ChevronRight;
  ChevronLeft = ChevronLeft;
  RotateCw = RotateCw;

  currentQuestionIndex = 0;
  selectedAnswers: Map<string, string> = new Map(); // questionId -> optionId
  showResults = false;
  quizResult: QuizResult | null = null;

  ngOnInit(): void {
    // Sort questions by order
    this.quiz.questions.sort((a, b) => a.order - b.order);
    this.quiz.questions.forEach((q) => {
      q.options.sort((a, b) => a.order - b.order);
    });

    // If there's a previous result (quiz was already passed), show it
    if (this.previousResult && this.previousResult.passed) {
      this.quizResult = this.previousResult;
      this.showResults = true;
    }
  }

  get currentQuestion(): QuizQuestion {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get progressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  get selectedOptionForCurrentQuestion(): string | undefined {
    return this.selectedAnswers.get(this.currentQuestion.id);
  }

  get hasAnsweredCurrentQuestion(): boolean {
    return this.selectedAnswers.has(this.currentQuestion.id);
  }

  get hasAnsweredAllQuestions(): boolean {
    return this.selectedAnswers.size === this.quiz.questions.length;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.quiz.questions.length - 1;
  }

  selectOption(optionId: string): void {
    this.selectedAnswers.set(this.currentQuestion.id, optionId);
  }

  previousQuestion(): void {
    if (!this.isFirstQuestion) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion(): void {
    if (!this.isLastQuestion) {
      this.currentQuestionIndex++;
    }
  }

  submitQuiz(): void {
    const result = this.calculateScore();
    this.quizResult = result;
    this.showResults = true;
    this.completed.emit(result);
  }

  private calculateScore(): QuizResult {
    let correctCount = 0;
    const answers: QuizAnswer[] = [];

    this.selectedAnswers.forEach((optionId, questionId) => {
      const question = this.quiz.questions.find((q) => q.id === questionId);
      const selectedOption = question?.options.find((o) => o.id === optionId);
      const isCorrect = selectedOption?.isCorrect || false;

      if (isCorrect) {
        correctCount++;
      }

      answers.push({
        questionId,
        selectedOptionId: optionId,
        isCorrect,
      });
    });

    const score = Math.round((correctCount / this.quiz.questions.length) * 100);
    const passed = score >= this.quiz.passingScore;

    return {
      score,
      passed,
      correctAnswers: correctCount,
      totalQuestions: this.quiz.questions.length,
      attemptNumber: this.attemptNumber,
      answers, // Include the answers in the result
    };
  }

  onRetakeQuiz(): void {
    this.currentQuestionIndex = 0;
    this.selectedAnswers.clear();
    this.showResults = false;
    this.quizResult = null;
    this.retake.emit();
  }

  onContinue(): void {
    this.continue.emit();
  }

  onSkipQuiz(): void {
    this.skip.emit();
  }
}
