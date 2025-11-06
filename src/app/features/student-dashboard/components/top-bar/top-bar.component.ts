import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-angular';
import { ThemeService } from '../../../../core/services/theme.service';

export interface UserData {
  name: string;
  email: string;
  avatar: string | null;
}

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
})
export class TopBarComponent {
  @Input() user!: UserData;
  @Output() settingsClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  // Icons
  User = User;
  Settings = Settings;
  LogOut = LogOut;
  Moon = Moon;
  Sun = Sun;

  isUserMenuOpen = false;

  constructor(public theme: ThemeService) {}

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onSettings(): void {
    this.settingsClick.emit();
    this.toggleUserMenu();
  }

  onLogout(): void {
    this.logoutClick.emit();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }
}
