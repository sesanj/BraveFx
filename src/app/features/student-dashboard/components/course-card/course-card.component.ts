import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play } from 'lucide-angular';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
  lastAccessed: string;
  nextLesson: string;
  totalLessons: number;
  completedLessons: number;
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './course-card.component.html',
  styleUrls: ['./course-card.component.css'],
})
export class CourseCardComponent {
  @Input() course!: Course;
  @Output() continue = new EventEmitter<string>();

  // Icons
  Play = Play;

  onContinue(): void {
    this.continue.emit(this.course.id);
  }
}
