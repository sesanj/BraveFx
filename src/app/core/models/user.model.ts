export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'student' | 'admin';
  createdAt: Date;
  enrolledCourses?: string[];
}
