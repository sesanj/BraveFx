import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../../core/models/course.model';
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
export class CourseCurriculumComponent {
  @Input() course: Course | null = null;
  @Input() isAllSectionsModalOpen = false;

  @Output() toggleSectionEvent = new EventEmitter<number>();
  @Output() openAllSectionsModalEvent = new EventEmitter<void>();
  @Output() closeAllSectionsModalEvent = new EventEmitter<void>();

  // Icons
  BookOpen = BookOpen;
  PlayCircle = PlayCircle;
  FileText = FileText;
  Infinity = Infinity;
  Users = Users;
  Award = Award;
  ChevronDown = ChevronDown;
  ChevronRight = ChevronRight;

  toggleSection(index: number): void {
    this.toggleSectionEvent.emit(index);
  }

  openAllSectionsModal(): void {
    this.openAllSectionsModalEvent.emit();
  }

  closeAllSectionsModal(): void {
    this.closeAllSectionsModalEvent.emit();
  }
}
