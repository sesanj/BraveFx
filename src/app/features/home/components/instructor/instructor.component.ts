import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Award,
  TrendingUp,
  Users,
  Youtube,
  Instagram,
  CheckCircle,
} from 'lucide-angular';

@Component({
  selector: 'app-instructor',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './instructor.component.html',
  styleUrl: './instructor.component.css',
})
export class InstructorComponent {
  readonly Award = Award;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Youtube = Youtube;
  readonly Instagram = Instagram;
  readonly CheckCircle = CheckCircle;

  // UPDATE: Your actual credentials
  credentials = [
    { text: '10+ years forex trading experience' }, // UPDATE: Your years of experience
    { text: 'Trained 6,000+ students worldwide' }, // UPDATE: Your student count
    { text: 'Professional trader & educator' }, // UPDATE: Your role/title
    { text: 'Active trader in multiple markets' }, // UPDATE: Your specialization
  ];

  // UPDATE: Your social media stats
  social = [
    { icon: Youtube, label: 'YouTube', count: '70K', color: '#ff0000' }, // UPDATE: Your YouTube count
    { icon: Instagram, label: 'Instagram', count: '38K', color: '#e4405f' }, // UPDATE: Your Instagram count
    { icon: Users, label: 'Students', count: '6K+', color: '#10b981' }, // UPDATE: Your student count
  ];
}
