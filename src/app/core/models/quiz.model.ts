export interface ModuleQuiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: QuizQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  order: number;
  options: QuizOption[];
}

export interface QuizOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export interface QuizAttempt {
  id?: string;
  userId: string;
  quizId: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  passed: boolean;
  attemptNumber: number;
  completedAt: Date | string;
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  attemptNumber: number;
}
