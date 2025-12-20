import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, LogOut, User } from 'lucide-angular';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css',
})
export class AdminHeaderComponent {
  LogOutIcon = LogOut;
  UserIcon = User;
  currentUser$;

  constructor(private authService: AuthService, private router: Router) {
    this.currentUser$ = this.authService.currentUser$;
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/']);
  }
}
