import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {
  TopBarComponent,
  UserData,
} from './components/top-bar/top-bar.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, TopBarComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent {
  // Mock user data
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: null,
    memberSince: 'January 2024',
  };

  constructor(private router: Router) {}

  onSettings(): void {
    this.router.navigate(['/dashboard/settings']);
  }

  onLogout(): void {
    this.router.navigate(['/login']);
  }
}
