import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import {
  LucideAngularModule,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Shield,
  LogOut,
} from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  isMenuOpen = false;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly Menu = Menu;
  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Shield = Shield;
  readonly LogOut = LogOut;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  get currentUser$() {
    return this.authService.currentUser$;
  }

  get isDarkMode() {
    return this.themeService.theme() === 'dark';
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }

  scrollToPricing() {
    const pricingSection = document.getElementById('enroll');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
