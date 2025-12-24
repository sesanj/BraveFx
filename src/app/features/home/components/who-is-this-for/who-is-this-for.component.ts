import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  CheckCircle,
  X,
  Target,
  TrendingUp,
  Users,
  Briefcase,
} from 'lucide-angular';

@Component({
  selector: 'app-who-is-this-for',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './who-is-this-for.component.html',
  styleUrl: './who-is-this-for.component.css',
})
export class WhoIsThisForComponent {
  @Output() enrollClick = new EventEmitter<void>();

  readonly CheckCircle = CheckCircle;
  readonly X = X;
  readonly Target = Target;
  readonly TrendingUp = TrendingUp;
  readonly Users = Users;
  readonly Briefcase = Briefcase;

  idealFor = [
    {
      icon: Target,
      title: 'A Complete Beginner',
      description:
        'You have zero trading experience and want to learn forex trading from scratch with a proven system.',
      highlights: [
        'No prior knowledge required',
        'Step-by-step guidance',
        'Start from the very basics',
      ],
    },
    {
      icon: TrendingUp,
      title: 'A Struggling Trader',
      description:
        "You've traded before and tired of blowing accounts and need a solid strategy and guidance.",
      highlights: [
        'Fix bad trading habits',
        'Learn proven strategies',
        'Stop losing money',
      ],
    },
    {
      icon: Users,
      title: 'Want a Side Income',
      description:
        'You want to trade part-time and build a secondary income stream through forex trading.',
      highlights: [
        'Trade part-time',
        'Flexible schedule',
        'Extra income potential',
      ],
    },
    {
      icon: Briefcase,
      title: 'A Full-Time Trader',
      description:
        "You're serious about making forex trading your full-time career to build wealth.",
      highlights: [
        'Professional mindset',
        'Career development',
        'Long-term success focus',
      ],
    },
  ];

  notFor = [
    'People looking for "get rich quick" schemes',
    'Individuals who just want to skim through and skip the lessons',
    'Traders unwilling to practice and put in the work',
    'Anyone expecting guaranteed profits without effort',
    "Those who aren't willing to follow instructions and a proven system",
    'Anyone who is looking for a signal service',
  ];
}
