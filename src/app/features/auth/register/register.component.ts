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
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

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
          console.log('Registration successful:', user);
          this.successMessage =
            'Registration successful! Please check your email to confirm your account, then login.';
          // Clear the form
          this.name = '';
          this.email = '';
          this.password = '';
          this.confirmPassword = '';
        } else {
          this.errorMessage = 'Registration failed';
        }
      },
      error: (error) => {
        console.error('Registration component error:', error);
        // Show more specific error messages
        if (error.message?.includes('already registered')) {
          this.errorMessage =
            'This email is already registered. Please login instead.';
        } else if (error.message?.includes('email')) {
          this.errorMessage = 'Invalid email address.';
        } else if (error.message?.includes('password')) {
          this.errorMessage = 'Password does not meet requirements.';
        } else {
          this.errorMessage =
            error.message || 'Registration failed. Please try again.';
        }
      },
    });
  }
}
