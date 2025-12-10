import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Lock,
  Palette,
  Sun,
  Moon,
  Bell,
  AlertTriangle,
} from 'lucide-angular';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit {
  // Icons
  User = User;
  Lock = Lock;
  Palette = Palette;
  Sun = Sun;
  Moon = Moon;
  Bell = Bell;
  AlertTriangle = AlertTriangle;

  user = {
    name: 'Loading...',
    email: '',
    avatar: null as string | null,
    memberSince: '',
  };

  // Track original email for comparison
  originalEmail = '';

  // Profile form
  profileName = '';
  profileEmail = '';

  // Password form
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  // Messages
  profileSuccessMessage = '';
  profileErrorMessage = '';
  passwordSuccessMessage = '';
  passwordErrorMessage = '';

  // Loading states
  isUpdatingProfile = false;
  isUpdatingPassword = false;
  isDeletingAccount = false;

  // Delete account confirmation
  showDeleteConfirmation = false;
  deleteConfirmationEmail = '';

  constructor(
    public themeService: ThemeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe((currentUser) => {
      if (currentUser) {
        this.user = {
          name: currentUser.name,
          email: currentUser.email,
          avatar: currentUser.avatar || null,
          memberSince: this.formatMemberSince(currentUser.createdAt),
        };

        // Initialize form values and store original email
        this.profileName = currentUser.name;
        this.profileEmail = currentUser.email;
        this.originalEmail = currentUser.email;
      }
    });
  }

  async updateProfile(): Promise<void> {
    // Clear previous messages
    this.profileSuccessMessage = '';
    this.profileErrorMessage = '';

    // Validate inputs
    if (!this.profileName.trim()) {
      this.profileErrorMessage = 'Name is required';
      return;
    }

    if (!this.profileEmail.trim()) {
      this.profileErrorMessage = 'Email is required';
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.profileEmail)) {
      this.profileErrorMessage = 'Please enter a valid email address';
      return;
    }

    // Check if email is changing (compare with original, not current user.email)
    const isEmailChanging = this.profileEmail.trim() !== this.originalEmail;

    this.isUpdatingProfile = true;

    try {
      await this.authService.updateUserProfile(
        this.profileName.trim(),
        this.profileEmail.trim()
      );

      if (isEmailChanging) {
        this.profileSuccessMessage =
          'Name updated! A confirmation email has been sent to your new email address. Please verify to complete the email change.';
      } else {
        this.profileSuccessMessage = 'Profile updated successfully!';
      }
    } catch (error: any) {
      this.profileErrorMessage =
        error.message || 'Failed to update profile. Please try again.';
    } finally {
      this.isUpdatingProfile = false;
    }
  }

  async changePassword(): Promise<void> {
    // Clear previous messages
    this.passwordSuccessMessage = '';
    this.passwordErrorMessage = '';

    // Validate inputs
    if (!this.currentPassword) {
      this.passwordErrorMessage = 'Current password is required';
      return;
    }

    if (!this.newPassword) {
      this.passwordErrorMessage = 'New password is required';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordErrorMessage = 'Password must be at least 8 characters long';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordErrorMessage = 'Passwords do not match';
      return;
    }

    this.isUpdatingPassword = true;

    try {
      // Verify current password before allowing change
      await this.authService.verifyCurrentPassword(
        this.user.email,
        this.currentPassword
      );

      // If verification succeeds, update to new password
      await this.authService.updatePassword(this.newPassword);

      this.passwordSuccessMessage = 'Password updated successfully!';

      // Clear password fields
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    } catch (error: any) {

      // Show specific error for wrong current password
      if (error.message?.includes('Invalid login credentials')) {
        this.passwordErrorMessage = 'Current password is incorrect';
      } else {
        this.passwordErrorMessage =
          error.message || 'Failed to update password. Please try again.';
      }
    } finally {
      this.isUpdatingPassword = false;
    }
  }

  openDeleteConfirmation(): void {
    this.showDeleteConfirmation = true;
    this.deleteConfirmationEmail = '';
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.deleteConfirmationEmail = '';
  }

  async confirmDeleteAccount(): Promise<void> {
    // Verify email matches
    if (this.deleteConfirmationEmail !== this.user.email) {
      alert('Email does not match. Please enter your email to confirm.');
      return;
    }

    this.isDeletingAccount = true;

    try {
      await this.authService.deleteAccount();
      // Auth service will handle logout and redirect
    } catch (error: any) {
      alert(error.message || 'Failed to delete account. Please try again.');
      this.isDeletingAccount = false;
      this.closeDeleteConfirmation();
    }
  }

  private formatMemberSince(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };
    return date.toLocaleDateString('en-US', options);
  }
}
