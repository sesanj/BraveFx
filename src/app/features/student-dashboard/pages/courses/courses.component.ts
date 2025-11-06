import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CourseCardComponent,
  Course,
} from '../../components/course-card/course-card.component';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
})
export class CoursesComponent {
  enrolledCourses: Course[] = [
    {
      id: '1',
      title: 'Complete Forex Trading Masterclass',
      instructor: 'BraveFx Academy',
      progress: 45,
      thumbnail: 'https://picsum.photos/seed/forex1/400/225',
      lastAccessed: '2 hours ago',
      nextLesson: 'Understanding Market Trends',
      totalLessons: 120,
      completedLessons: 54,
    },
    {
      id: '2',
      title: 'Advanced Technical Analysis',
      instructor: 'BraveFx Academy',
      progress: 20,
      thumbnail: 'https://picsum.photos/seed/forex2/400/225',
      lastAccessed: '1 day ago',
      nextLesson: 'Fibonacci Retracements',
      totalLessons: 80,
      completedLessons: 16,
    },
    {
      id: '3',
      title: 'Risk Management Strategies',
      instructor: 'BraveFx Academy',
      progress: 100,
      thumbnail: 'https://picsum.photos/seed/forex3/400/225',
      lastAccessed: '3 days ago',
      nextLesson: 'Course Completed',
      totalLessons: 50,
      completedLessons: 50,
    },
  ];

  constructor(private router: Router) {}

  continueCourse(courseId: string): void {
    this.router.navigate(['/course-player', courseId]);
  }
}
