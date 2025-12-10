import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isResetting = false;
  isValidToken = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    // Give Supabase time to process the recovery token from URL
    setTimeout(async () => {
      await this.checkResetToken();
    }, 500);
  }

  private async checkResetToken() {
    try {
      // Check if Supabase has established a session from the recovery token
      const {
        data: { session },
      } = await this.supabaseService.client.auth.getSession();

      if (session) {
        // Valid recovery session exists - show the form
        this.isValidToken = true;
      } else {
        this.errorMessage = 'Invalid or expired password reset link.';
      }
    } catch (error) {
      this.errorMessage = 'Invalid or expired password reset link.';
    }
  }

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.newPassword) {
      this.errorMessage = 'Password is required';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isResetting = true;

    try {
      // Simply update the password - we already have a valid session from the recovery token
      const { error } = await this.supabaseService.client.auth.updateUser({
        password: this.newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      this.successMessage =
        'Password reset successful! Redirecting to login...';

      // Clear form
      this.newPassword = '';
      this.confirmPassword = '';

      // Sign out and redirect
      await this.supabaseService.client.auth.signOut();

      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error: any) {
      this.errorMessage =
        error.message || 'Failed to reset password. Please try again.';
      this.isResetting = false;
    }
  }
}
