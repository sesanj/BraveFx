import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {
  TopBarComponent,
  UserData,
} from './components/top-bar/top-bar.component';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopBarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  user: UserData = {
    name: 'Loading...',
    email: '',
    avatar: null,
  };

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe((currentUser) => {
      if (currentUser) {
        this.user = {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar || null,
        };
      }
    });
  }

  onSettings(): void {
    this.router.navigate(['/dashboard/settings']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
