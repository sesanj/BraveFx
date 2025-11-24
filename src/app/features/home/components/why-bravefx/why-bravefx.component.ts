import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Sparkles,
  TrendingUp,
  Trophy,
  Lightbulb,
  Users,
} from 'lucide-angular';

export interface WhyBraveFxStats {
  students: string;
  youtubeFollowers: string;
  instagramFollowers: string;
  tiktokFollowers: string;
  discordMembers: string;
  reviews: string;
  rating: number;
}

export interface WhyBraveFxFeature {
  title: string;
  description: string;
}

@Component({
  selector: 'app-why-bravefx',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './why-bravefx.component.html',
  styleUrls: ['./why-bravefx.component.css'],
})
export class WhyBravefxComponent {
  // Component owns its data
  whyBraveFxStats: WhyBraveFxStats = {
    students: '6,000+',
    youtubeFollowers: '75K',
    instagramFollowers: '38K',
    tiktokFollowers: '5K',
    discordMembers: '3K',
    reviews: '1,700+',
    rating: 4.6,
  };

  whyBraveFx: WhyBraveFxFeature[] = [
    {
      title: '10+ Years Experience',
      description:
        'Learn from a seasoned trader with over a decade of real market experience. No fluff, just pure knowledge.',
    },
    {
      title: 'Battle-Tested Strategies',
      description:
        'Proven strategies used by successful traders. Real market experience translated into actionable lessons.',
    },
    {
      title: 'Lifetime Community Support',
      description:
        "Join our active Discord community. Get ongoing support, share trades, and grow with traders at every level. You're never alone.",
    },
  ];

  // Icons
  readonly SparklesIcon = Sparkles;
  readonly TrendingUpIcon = TrendingUp;
  readonly TrophyIcon = Trophy;
  readonly LightbulbIcon = Lightbulb;
  readonly UsersIcon = Users;

  getIcon(index: number) {
    const icons = [this.TrophyIcon, this.LightbulbIcon, this.UsersIcon];
    return icons[index] || this.TrophyIcon;
  }
}
