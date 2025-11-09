export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  currency: string;
  thumbnail: string;
  duration: number; // in seconds
  totalLessons: number;
  rating: number;
  studentsEnrolled: number;
  modules: Module[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  hasQuiz?: boolean;
  quiz?: any; // Will be populated with ModuleQuiz when needed
  duration?: string; // e.g., "2h 45m" - optional as it's calculated
  isOpen?: boolean; // For accordion UI state
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string | number; // string for formatted (e.g., "5:30"), number for seconds
  order: number;
  resources: Resource[];
  isPreview: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'pdf' | 'excel' | 'image' | 'other';
}

export interface LessonProgress {
  userId: string;
  lessonId: string;
  lastPosition: number; // in seconds
  progressPercentage: number;
  completed: boolean;
  lastUpdated: Date;
}
