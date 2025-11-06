import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-angular';

export interface StatData {
  coursesEnrolled: number;
  coursesCompleted: number;
  hoursLearned: number;
  certificatesEarned: number;
}

@Component({
  selector: 'app-stats-grid',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stats-grid.component.html',
  styleUrls: ['./stats-grid.component.css'],
})
export class StatsGridComponent {
  @Input() stats!: StatData;

  // Icons
  BookOpen = BookOpen;
  CheckCircle = CheckCircle;
  Clock = Clock;
  Award = Award;
}
