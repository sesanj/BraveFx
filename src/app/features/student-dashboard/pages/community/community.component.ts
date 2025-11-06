import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Users,
  MessageCircle,
  TrendingUp,
} from 'lucide-angular';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
})
export class CommunityComponent {
  // Icons
  Users = Users;
  MessageCircle = MessageCircle;
  TrendingUp = TrendingUp;

  // Community links - Update these with your actual social media URLs
  communityLinks = {
    discord: 'https://discord.gg/bravefx',
    youtube: 'https://youtube.com/@bravefx',
    instagram: 'https://instagram.com/bravefx',
  };
}
