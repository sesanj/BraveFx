import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  CheckCircle,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-angular';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './student-progress.component.html',
  styleUrl: './student-progress.component.css',
})
export class StudentProgressComponent {
  @Output() enrollClick = new EventEmitter<void>();

  readonly CheckCircle = CheckCircle;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Clock = Clock;

  progressStories = [
    {
      name: 'Robinson Clive',
      timeframe: '1 Month In',
      avatar: 'RC',
      color: '#10b981',
      milestones: [
        'Completed foundational modules',
        'Understanding chart patterns',
        'Practicing on demo account',
        'Building trading discipline',
      ],
      quote:
        "I finally understand what I'm doing. The step-by-step approach makes everything click.",
    },
    {
      name: 'Michael Oyedeji',
      timeframe: '2 Months In',
      avatar: 'MO',
      color: '#3b82f6',
      milestones: [
        'Mastered technical analysis',
        'Executing consistent trades',
        'Following risk management rules',
        'Reading market trends confidently',
      ],
      quote:
        "The course structure is brilliant. Couldn't ask for a better course. Thank you Sesan.",
    },
    {
      name: 'Chen Zhao',
      timeframe: '3 Months In',
      avatar: 'CZ',
      color: '#a855f7',
      milestones: [
        'Developed personal trading strategy',
        'Trading live with confidence',
        'Managing emotions effectively',
        'Consistent Account Growth',
      ],
      quote:
        "I went from zero knowledge to confidently trading live. Best investment I've made in myself.",
    },
  ];

  stats = [
    { number: '6,000+', label: 'Students Trained' },
    { number: '89%', label: 'Complete the Course' },
    { number: '4.6★', label: 'Average Rating' },
    { number: '40+', label: 'Countries' },
  ];
}
