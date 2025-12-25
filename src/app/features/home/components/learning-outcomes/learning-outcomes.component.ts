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
  readonly Target = Target;
  readonly ChevronRight = ChevronRight;

  learningOutcomes: LearningOutcome[] = [
    {
      icon: LineChart,
      title: 'Develop Winning Strategies',
      description:
        'You will be able to develop your own profitable trading strategies.',
    },
    {
      icon: Brain,
      title: 'Master Technical Analysis',
      description:
        'You will be able to analyze any chart and trade any market. Forex, crypto, stocks, etc.',
    },
    {
      icon: Zap,
      title: 'Execute with Confidence',
      description:
        'You will know how and when to enter and exit trades with confidence and precision.',
    },

    {
      icon: Wallet,
      title: 'Risk Management',
      description:
        'You will know how to protect your capital with professional risk management techniques.',
    },
    {
      icon: TrendingUp,
      title: 'Spot High-Probability Trades',
      description:
        'You will be able to identify the best trading opportunities with multi-timeframe analysis.',
    },
    {
      icon: BookMarked,
      title: 'Build a Trading Plan',
      description:
        'You will be able to build a trading plan for consistent growth.',
    },
  ];
}
