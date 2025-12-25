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
  Home,
  Info,
  BookOpen,
  LogIn,
} from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  host: {
    '[class.header-hidden]': 'isHeaderHidden',
  },
})
export class HeaderComponent {
  isMenuOpen = false;
  isAuthLoading = true;
  isHeaderHidden = false;
  private lastScrollTop = 0;
  readonly Moon = Moon;
  readonly Sun = Sun;
  readonly Menu = Menu;
  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly LayoutDashboard = LayoutDashboard;
  readonly Shield = Shield;
  readonly LogOut = LogOut;
  readonly Home = Home;
  readonly Info = Info;
  readonly BookOpen = BookOpen;
  readonly LogIn = LogIn;

  constructor(
    public authService: AuthService,
    public themeService: ThemeService
  ) {
    // Wait for auth to initialize before showing UI
    this.authService.waitForAuthInit().then(() => {
      this.isAuthLoading = false;
    });

    // Add scroll listener to hide header after hero section
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => this.handleScroll(), {
        passive: true,
      });
    }
  }

  private handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const heroHeight = window.innerHeight * 0.85; // Approximate hero section height

    // Hide header when scrolled past hero section
    if (scrollTop > heroHeight && scrollTop > this.lastScrollTop) {
      this.isHeaderHidden = true;
    } else if (scrollTop < 100) {
      // Show header when near top
      this.isHeaderHidden = false;
    }

    this.lastScrollTop = scrollTop;
  }

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
}
