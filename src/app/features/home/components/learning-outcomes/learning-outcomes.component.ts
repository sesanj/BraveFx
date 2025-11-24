import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Target,
  ChevronRight,
  Brain,
  LineChart,
  Wallet,
  Zap,
  TrendingUp,
  BookMarked,
} from 'lucide-angular';

interface LearningOutcome {
  icon: any;
  title: string;
  description: string;
}

@Component({
  selector: 'app-learning-outcomes',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './learning-outcomes.component.html',
  styleUrls: ['./learning-outcomes.component.css'],
})
export class LearningOutcomesComponent {
  @Output() curriculumClick = new EventEmitter<void>();

  readonly Target = Target;
  readonly ChevronRight = ChevronRight;

  learningOutcomes: LearningOutcome[] = [
    {
      icon: Brain,
      title: 'Master Technical Analysis',
      description:
        'Read charts like a pro. Learn price action, patterns, structures, indicators, and more.',
    },
    {
      icon: LineChart,
      title: 'Develop Winning Strategies',
      description:
        'Build and backtest profitable trading strategies that work in any market condition.',
    },
    {
      icon: Wallet,
      title: 'Perfect Risk Management',
      description:
        'Protect your capital with professional risk management and position sizing techniques.',
    },
    {
      icon: Zap,
      title: 'Execute with Confidence',
      description:
        'Master trading psychology and eliminate emotional decision-making for consistency.',
    },
    {
      icon: TrendingUp,
      title: 'Spot High-Probability Trades',
      description:
        'Identify the best trading opportunities with multi-timeframe analysis.',
    },
    {
      icon: BookMarked,
      title: 'Build a Trading Plan',
      description:
        'Create your personalized trading plan and journal for continuous improvement.',
    },
  ];

  scrollToCurriculum() {
    this.curriculumClick.emit();
  }
}
