import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Bell,
  User,
  Settings,
  LogOut,
} from 'lucide-angular';

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
  Bell = Bell;
  User = User;
  Settings = Settings;
  LogOut = LogOut;

  isUserMenuOpen = false;

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
}
