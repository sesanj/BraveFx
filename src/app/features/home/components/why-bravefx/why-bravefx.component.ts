import { Component, Input } from '@angular/core';
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
  @Input() whyBraveFxStats!: WhyBraveFxStats;
  @Input() whyBraveFx: WhyBraveFxFeature[] = [];

  // Icons (hardcoded for the 3 feature cards)
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
