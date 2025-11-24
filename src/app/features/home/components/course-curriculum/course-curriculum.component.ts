import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../../core/models/course.model';
import { CourseService } from '../../../../core/services/course.service';
import {
  LucideAngularModule,
  BookOpen,
  PlayCircle,
  FileText,
  Infinity,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-course-curriculum',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './course-curriculum.component.html',
  styleUrls: ['./course-curriculum.component.css'],
})
export class CourseCurriculumComponent implements OnInit {
  course: Course | null = null;
  isAllSectionsModalOpen = false;

  // Icons
  BookOpen = BookOpen;
  PlayCircle = PlayCircle;
  FileText = FileText;
  Infinity = Infinity;
  Users = Users;
  Award = Award;
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  constructor(private courseService: CourseService) {}

  ngOnInit() {
    // Load first available course from database
    this.courseService.getAllCourses().subscribe((courses) => {
      if (courses && courses.length > 0) {
        // Get full course details with modules and lessons
        this.courseService.getCourse(courses[0].id).subscribe((course) => {
          this.course = course;
          // Add isOpen property to each module for accordion functionality
          this.course.modules.forEach((module) => {
            (module as any).isOpen = false;
          });
        });
      }
    });
  }

  toggleSection(index: number): void {
    if (this.course && this.course.modules[index]) {
      (this.course.modules[index] as any).isOpen = !(
        this.course.modules[index] as any
      ).isOpen;
    }
  }

  openAllSectionsModal(): void {
    this.isAllSectionsModalOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  closeAllSectionsModal(): void {
    this.isAllSectionsModalOpen = false;
    document.body.style.overflow = ''; // Restore scroll
  }
}
