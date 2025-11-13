import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Play,
  CheckCircle,
  Award,
  BookOpen,
} from 'lucide-angular';

export interface Activity {
  type: 'lesson' | 'quiz' | 'certificate' | 'section';
  title: string;
  course: string;
  time: string;
  timestamp: Date;
}

@Component({
  selector: 'app-activity-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './activity-list.component.html',
  styleUrls: ['./activity-list.component.css'],
})
export class ActivityListComponent {
  @Input() activities: Activity[] = [];
  @Input() showViewAll: boolean = true;
  @Output() viewAll = new EventEmitter<void>();

  // Icons
  Play = Play;
  CheckCircle = CheckCircle;
  Award = Award;
  BookOpen = BookOpen;

  getIcon(type: string) {
    switch (type) {
      case 'lesson':
        return this.Play;
      case 'quiz':
        return this.CheckCircle;
      case 'certificate':
        return this.Award;
      case 'section':
        return this.BookOpen;
      default:
        return this.Play;
    }
  }

  onViewAll(): void {
    this.viewAll.emit();
  }
}
