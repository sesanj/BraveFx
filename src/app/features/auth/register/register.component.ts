import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.authService.register(this.email, this.password, this.name).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Registration failed';
        }
      },
      error: (error) => {
        this.errorMessage = 'Registration failed. Please try again.';
      },
    });
  }
}
