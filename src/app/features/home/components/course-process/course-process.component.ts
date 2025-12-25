import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  BookOpen,
  TrendingUp,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-course-process',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './course-process.component.html',
  styleUrl: './course-process.component.css',
})
export class CourseProcessComponent {
  @Output() enrollClick = new EventEmitter<void>();

  readonly BookOpen = BookOpen;
  readonly TrendingUp = TrendingUp;
  readonly Award = Award;
  readonly Sparkles = Sparkles;
  readonly ChevronRight = ChevronRight;

  courses = [
    {
      step: '01',
      icon: BookOpen,
      title: 'Beginners Class',
      description:
        'In this class, you will learn about the basics and a brief introduction to forex trading, the forex market and a few concepts to get you prepared for trading.',
      color: '#10b981',
    },
    {
      step: '02',
      icon: TrendingUp,
      title: 'Intermediate Class',
      description:
        'In this class, we will introduce you to market analysis and teach you a few concepts along with a simple and effective trading strategy to prepare you for the advance class.',
      color: '#3b82f6',
    },
    {
      step: '03',
      icon: Award,
      title: 'Advance Class',
      description:
        "In this class, we will dive into trading proper and teach you all that's required to help you become a profitable professional trader.",
      color: '#a855f7',
    },
  ];

  onEnrollClick() {
    this.enrollClick.emit();
  }
}
