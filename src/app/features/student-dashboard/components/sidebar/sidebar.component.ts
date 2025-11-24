import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  FileText,
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
  // Icons
  LayoutDashboard = LayoutDashboard;
  BookOpen = BookOpen;
  TrendingUp = TrendingUp;
  FileText = FileText;
  Users = Users;
  Settings = Settings;
  HelpCircle = HelpCircle;
  Moon = Moon;
  Sun = Sun;

  constructor(public theme: ThemeService) {}

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
