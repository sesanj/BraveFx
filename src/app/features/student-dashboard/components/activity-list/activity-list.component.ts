import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Play, CheckCircle, Award } from 'lucide-angular';

export interface Activity {
  type: 'lesson' | 'quiz' | 'certificate';
  title: string;
  course: string;
  time: string;
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

  // Icons
  Play = Play;
  CheckCircle = CheckCircle;
  Award = Award;

  getIcon(type: string) {
    switch (type) {
      case 'lesson':
        return this.Play;
      case 'quiz':
        return this.CheckCircle;
      case 'certificate':
        return this.Award;
      default:
        return this.Play;
    }
  }
}
