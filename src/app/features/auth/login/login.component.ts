import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  successMessage = '';
  showForgotPassword = false;
  resetEmail = '';
  isResettingPassword = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          console.log('Login successful:', user);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid credentials';
        }
      },
      error: (error) => {
        console.error('Login component error:', error);
        // Show more specific error messages
        if (error.message?.includes('Email not confirmed')) {
          this.errorMessage =
            'Please confirm your email address before logging in. Check your inbox.';
        } else if (error.message?.includes('Invalid login credentials')) {
          this.errorMessage = 'Invalid email or password.';
        } else if (error.message?.includes('profile')) {
          this.errorMessage =
            'Account setup incomplete. Please contact support.';
        } else {
          this.errorMessage =
            error.message || 'Login failed. Please try again.';
        }
      },
    });
  }

  openForgotPassword() {
    this.showForgotPassword = true;
    this.resetEmail = this.email; // Pre-fill with login email if provided
    this.errorMessage = '';
    this.successMessage = '';
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
    this.resetEmail = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  async sendPasswordReset() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate email
    if (!this.resetEmail.trim()) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.resetEmail)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isResettingPassword = true;

    try {
      await this.authService.resetPassword(this.resetEmail.trim());
      this.successMessage =
        'Password reset email sent! Please check your inbox.';
      this.resetEmail = '';

      // Auto-close modal after 3 seconds
      setTimeout(() => {
        this.closeForgotPassword();
      }, 3000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      this.errorMessage =
        error.message || 'Failed to send reset email. Please try again.';
    } finally {
      this.isResettingPassword = false;
    }
  }
}
