import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  User,
  Lock,
  Palette,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
} from 'lucide-angular';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  // Icons
  User = User;
  Lock = Lock;
  Palette = Palette;
  Sun = Sun;
  Moon = Moon;
  Bell = Bell;
  AlertTriangle = AlertTriangle;

  // Mock user data
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    memberSince: 'January 2024',
  };

  constructor(public themeService: ThemeService) {}
}
