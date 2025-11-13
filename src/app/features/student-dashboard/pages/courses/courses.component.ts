import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  CourseCardComponent,
  Course,
} from '../../components/course-card/course-card.component';
import { CourseService } from '../../../../core/services/course.service';
import { ProgressService } from '../../../../core/services/progress.service';
import { Course as CourseModel } from '../../../../core/models/course.model';
import { forkJoin } from 'rxjs';

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

  constructor(
    private router: Router,
    private courseService: CourseService,
    private progressService: ProgressService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (courses: CourseModel[]) => {
        // Load progress for each course
        const progressRequests = courses.map((course) =>
          forkJoin({
            progress: this.progressService.getCourseProgress(
              course.id,
              course.totalLessons
            ),
            completedIds: this.progressService.getCompletedLessonIds(course.id),
            lastLesson: this.progressService.getLastWatchedLesson(course.id),
          })
        );

        forkJoin(progressRequests).subscribe({
          next: (progressData) => {
            this.enrolledCourses = courses.map((course, index) => {
              const { progress, completedIds, lastLesson } =
                progressData[index];
              return {
                id: course.id,
                title: course.title,
                instructor: course.instructor,
                progress: progress,
                thumbnail:
                  course.thumbnail ||
                  'https://picsum.photos/seed/forex/400/225',
                lastAccessed: lastLesson ? 'Recently' : 'Not started',
                nextLesson:
                  completedIds.size > 0
                    ? 'Continue Learning'
                    : 'Start Learning',
                totalLessons: course.totalLessons,
                completedLessons: completedIds.size,
              };
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading progress:', error);
            // Still show courses even if progress fails
            this.enrolledCourses = courses.map((course) => ({
              id: course.id,
              title: course.title,
              instructor: course.instructor,
              progress: 0,
              thumbnail:
                course.thumbnail || 'https://picsum.photos/seed/forex/400/225',
              lastAccessed: 'Recently',
              nextLesson: 'Start Learning',
              totalLessons: course.totalLessons,
              completedLessons: 0,
            }));
            this.isLoading = false;
          },
        });
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
