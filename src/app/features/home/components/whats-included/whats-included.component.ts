import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Package,
  BookOpen,
  TrendingUp,
  Award,
  PlayCircle,
  Infinity,
  MessageCircle,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Smartphone,
  Sparkles,
} from 'lucide-angular';

@Component({
  selector: 'app-whats-included',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './whats-included.component.html',
  styleUrl: './whats-included.component.css',
})
export class WhatsIncludedComponent {
  @Input() originalPrice: number = 149;
  @Input() finalPrice: number = 149;
  @Input() discountBadgeText: string = '85% OFF Limited Time';
  @Output() enrollClick = new EventEmitter<void>();

  readonly perceivedValue = 997; // Marketing value for anchoring

  get actualSavings(): number {
    return this.perceivedValue - this.finalPrice;
  }

  get discountPercentage(): number {
    return Math.round(
      ((this.perceivedValue - this.finalPrice) / this.perceivedValue) * 100
    );
  }

  readonly Package = Package;
  readonly BookOpen = BookOpen;
  readonly TrendingUp = TrendingUp;
  readonly Award = Award;
  readonly PlayCircle = PlayCircle;
  readonly Infinity = Infinity;
  readonly MessageCircle = MessageCircle;
  readonly ClipboardCheck = ClipboardCheck;
  readonly FileText = FileText;
  readonly CheckCircle = CheckCircle;
  readonly Smartphone = Smartphone;
  readonly Sparkles = Sparkles;

  courses = [
    {
      icon: BookOpen,
      title: 'Beginners Class',
      description:
        'Master the fundamentals and get properly introduced to forex trading',
      color: '#10b981',
    },
    {
      icon: TrendingUp,
      title: 'Intermediate Class',
      description: 'Learn market analysis and proven trading strategies',
      color: '#3b82f6',
    },
    {
      icon: Award,
      title: 'Advance Class',
      description: 'Become a professional trader with advanced techniques',
      color: '#a855f7',
    },
  ];

  features = [
    {
      icon: PlayCircle,
      title: '200+ HD Video Lessons',
      description: 'Comprehensive step-by-step education',
    },
    {
      icon: Infinity,
      title: 'Lifetime Access',
      description: 'Learn at your own pace, forever',
    },
    {
      icon: MessageCircle,
      title: '24/7 Learning Support',
      description: 'Get help whenever you need it',
    },
    {
      icon: ClipboardCheck,
      title: 'Trading Plan Templates',
      description: 'Professional risk management tools',
    },
    {
      icon: FileText,
      title: '45+ Downloadable PDFs',
      description: 'Reference guides & checklists',
    },
    {
      icon: CheckCircle,
      title: 'Skill Tests & Quizzes',
      description: 'Track your progress and mastery',
    },
    {
      icon: Award,
      title: 'Certificate of Completion',
      description: 'Showcase your achievement',
    },
    {
      icon: Smartphone,
      title: 'Access on Any Device',
      description: 'Desktop, tablet, or mobile',
    },
  ];
}
