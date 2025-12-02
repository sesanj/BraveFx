import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Target,
  Users,
  TrendingUp,
  Award,
  Heart,
  Lightbulb,
  Shield,
  Zap,
  Instagram,
  Youtube,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-angular';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'About BraveFx - Expert Forex Trading Education',
      description:
        'Meet the team behind BraveFx. 6,247+ students, 108K+ social following, and a mission to provide practical forex trading education that works.',
      keywords:
        'about bravefx, forex educators, trading mentors, forex academy',
      url: 'https://bravefx.io/about',
      image: 'https://bravefx.io/assets/og-image.jpg',
    });
  }
  // Icons
  Target = Target;
  Users = Users;
  TrendingUp = TrendingUp;
  Award = Award;
  Heart = Heart;
  Lightbulb = Lightbulb;
  Shield = Shield;
  Zap = Zap;
  Instagram = Instagram;
  Youtube = Youtube;
  MessageCircle = MessageCircle;
  ArrowRight = ArrowRight;
  CheckCircle2 = CheckCircle2;

  stats = [
    { number: '6,247+', label: 'Happy Students', icon: Users },
    { number: '4.6⭐', label: 'Average Rating', icon: Award },
    { number: '1,700+', label: 'Reviews', icon: CheckCircle2 },
    { number: '108K+', label: 'Social Following', icon: TrendingUp },
  ];

  values = [
    {
      icon: Target,
      title: 'Practical Education',
      description:
        'We teach real-world strategies that we actually use in our own trading, not just theory.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description:
        "You're not alone. Join a thriving community of traders supporting each other's growth.",
    },
    {
      icon: TrendingUp,
      title: 'Continuous Growth',
      description:
        'Markets evolve, and so do we. Get lifetime access to course updates and new content.',
    },
    {
      icon: Award,
      title: 'Quality First',
      description:
        'Every lesson is crafted with care to ensure you get maximum value from your investment.',
    },
  ];

  socialPlatforms = [
    {
      icon: Instagram,
      name: 'Instagram',
      followers: '38K+ Followers',
      description:
        'Daily trading tips, market analysis, and behind-the-scenes content',
      gradient: 'instagram-gradient',
    },
    {
      icon: Youtube,
      name: 'YouTube',
      followers: '70K+ Subscribers',
      description:
        'Free video lessons, strategy breakdowns, and live trading sessions',
      gradient: 'youtube-gradient',
    },
    {
      icon: MessageCircle,
      name: 'Discord',
      followers: '2,500+ Members',
      description:
        'Active trading community with real-time discussions and support',
      gradient: 'discord-gradient',
    },
  ];
}
