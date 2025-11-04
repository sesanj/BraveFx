import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Course, Lesson, Module } from '../models/course.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  // Dummy course data
  private dummyCourse: Course = {
    id: '1',
    title: 'Complete Forex Trading Mastery',
    description:
      'Master forex trading from beginner to advanced with 25+ hours of comprehensive video lessons, 50+ downloadable resources, and skill tests.',
    instructor: 'BraveFx',
    price: 149,
    currency: 'USD',
    thumbnail:
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    duration: 90000, // 25 hours in seconds
    totalLessons: 120,
    rating: 4.6,
    studentsEnrolled: 6247,
    modules: [
      {
        id: 'm1',
        title: 'Introduction to Forex Trading',
        description: 'Understanding the basics of forex market',
        order: 1,
        lessons: [
          {
            id: 'l1',
            title: 'What is Forex Trading?',
            description: 'Introduction to the foreign exchange market',
            videoUrl: 'https://player.vimeo.com/video/76979871', // Dummy Vimeo URL
            duration: 1200,
            order: 1,
            resources: [
              {
                id: 'r1',
                title: 'Forex Basics PDF',
                url: '/assets/dummy.pdf',
                type: 'pdf',
              },
            ],
            isPreview: true,
          },
          {
            id: 'l2',
            title: 'Understanding Currency Pairs',
            description: 'Major, minor, and exotic pairs explained',
            videoUrl: 'https://player.vimeo.com/video/76979871',
            duration: 1800,
            order: 2,
            resources: [
              {
                id: 'r2',
                title: 'Currency Pairs Cheat Sheet',
                url: '/assets/dummy.pdf',
                type: 'pdf',
              },
            ],
            isPreview: false,
          },
        ],
      },
      {
        id: 'm2',
        title: 'Technical Analysis Fundamentals',
        description: 'Learn to read charts and identify patterns',
        order: 2,
        lessons: [
          {
            id: 'l3',
            title: 'Candlestick Patterns',
            description: 'Reading and interpreting candlestick patterns',
            videoUrl: 'https://player.vimeo.com/video/76979871',
            duration: 2400,
            order: 1,
            resources: [],
            isPreview: false,
          },
        ],
      },
      {
        id: 'm3',
        title: 'Risk Management Strategies',
        description: 'Protect your capital and manage risk effectively',
        order: 3,
        lessons: [
          {
            id: 'l4',
            title: 'Position Sizing',
            description: 'Calculate proper position sizes',
            videoUrl: 'https://player.vimeo.com/video/76979871',
            duration: 1500,
            order: 1,
            resources: [
              {
                id: 'r3',
                title: 'Position Size Calculator',
                url: '/assets/dummy.xlsx',
                type: 'excel',
              },
            ],
            isPreview: false,
          },
        ],
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-10-01'),
  };

  getCourse(id: string): Observable<Course> {
    return of(this.dummyCourse);
  }

  getAllCourses(): Observable<Course[]> {
    return of([this.dummyCourse]);
  }

  getLesson(
    courseId: string,
    lessonId: string
  ): Observable<Lesson | undefined> {
    const lesson = this.dummyCourse.modules
      .flatMap((m) => m.lessons)
      .find((l) => l.id === lessonId);
    return of(lesson);
  }
}
