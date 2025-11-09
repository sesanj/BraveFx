import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CourseCardComponent,
  Course,
} from '../../components/course-card/course-card.component';
import { CourseService } from '../../../../core/services/course.service';
import { Course as CourseModel } from '../../../../core/models/course.model';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, CourseCardComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
})
export class CoursesComponent implements OnInit {
  enrolledCourses: Course[] = [];
  isLoading: boolean = true;

  constructor(private router: Router, private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses: CourseModel[]) => {
        // Transform database courses to dashboard course format
        this.enrolledCourses = courses.map((course) => ({
          id: course.id,
          title: course.title,
          instructor: course.instructor,
          progress: 0, // TODO: Calculate from lesson_progress table
          thumbnail:
            course.thumbnail || 'https://picsum.photos/seed/forex/400/225',
          lastAccessed: 'Recently', // TODO: Get from course_progress table
          nextLesson: 'Start Learning', // TODO: Get from course_progress table
          totalLessons: course.totalLessons,
          completedLessons: 0, // TODO: Calculate from lesson_progress table
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      },
    });
  }

  continueCourse(courseId: string): void {
    this.router.navigate(['/course', courseId]);
  }
}
