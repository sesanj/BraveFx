import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  Moon,
  Sun,
} from 'lucide-angular';
import { ThemeService } from '../../../../core/services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  @Input() activeTab:
    | 'overview'
    | 'courses'
    | 'progress'
    | 'community'
    | 'settings'
    | 'support' = 'overview';
  @Output() tabChange = new EventEmitter<
    'overview' | 'courses' | 'progress' | 'community' | 'settings' | 'support'
  >();

  // Icons
  LayoutDashboard = LayoutDashboard;
  BookOpen = BookOpen;
  TrendingUp = TrendingUp;
  Users = Users;
  Settings = Settings;
  HelpCircle = HelpCircle;
  Moon = Moon;
  Sun = Sun;

  themeService = ThemeService;

  constructor(public theme: ThemeService) {}

  setActiveTab(
    tab:
      | 'overview'
      | 'courses'
      | 'progress'
      | 'community'
      | 'settings'
      | 'support'
  ): void {
    this.tabChange.emit(tab);
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
