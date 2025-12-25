import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  X,
  CheckCircle,
  Lightbulb,
  TrendingDown,
  Shield,
  Target,
  Users,
} from 'lucide-angular';

@Component({
  selector: 'app-why-traders-fail',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './why-traders-fail.component.html',
  styleUrl: './why-traders-fail.component.css',
})
export class WhyTradersFailComponent {
  readonly X = X;
  readonly CheckCircle = CheckCircle;
  readonly Lightbulb = Lightbulb;

  mistakes = [
    {
      icon: TrendingDown,
      mistake: 'No Trading Plan',
      description:
        'Most traders wing it and trade emotionally without a system',
      solution: 'We teach you to build a systematic, rule-based trading plan',
      result: 'Consistent, unemotional trading decisions',
    },
    {
      icon: Shield,
      mistake: 'Poor Risk Management',
      description: 'Traders risk too much per trade and blow their accounts',
      solution:
        'Risk calculator, position sizing templates, and proven methods',
      result: 'Protected capital and sustainable growth',
    },
    {
      icon: Target,
      mistake: 'Chasing "Holy Grail" Strategies',
      description: 'Jump from strategy to strategy, never mastering one',
      solution:
        'We focus on Price Action. The most efficient approach to trading.',
      result: 'Deep mastery and confident execution',
    },
    {
      icon: Users,
      mistake: 'Trading Alone Without Support',
      description:
        'No feedback, no accountability, most give up when struggling',
      solution:
        '3K+ Discord community, Weekly YouTube market update, and peer support',
      result: 'Support system, accountability, and motivation',
    },
  ];
}
