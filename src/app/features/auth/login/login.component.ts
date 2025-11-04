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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid credentials';
        }
      },
      error: (error) => {
        this.errorMessage = 'Login failed. Please try again.';
      },
    });
  }
}
