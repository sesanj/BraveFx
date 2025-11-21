import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SupabaseService } from './core/services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'BraveFx';
  showHeaderFooter = true;
  showHeader = true;
  showFooter = true;
  isInitializing = true; // Prevent flash of wrong header

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Hide header/footer on course player and dashboard routes
    // Hide only footer on auth routes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const isCoursePage = event.url.includes('/course/');
        const isDashboard = event.url.includes('/dashboard');
        const isAuthPage =
          event.url.includes('/login') ||
          event.url.includes('/register') ||
          event.url.includes('/reset-password');

        // Hide both header and footer on course player and dashboard
        this.showHeaderFooter = !isCoursePage && !isDashboard;

        // Show header on auth pages, but hide footer
        this.showHeader = !isCoursePage && !isDashboard;
        this.showFooter = !isCoursePage && !isDashboard && !isAuthPage;

        // Mark initialization complete after first navigation
        this.isInitializing = false;

        // Force scroll to top immediately - try multiple approaches
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 0);
      });

    // Test Supabase connection
    this.testSupabaseConnection();
  }

  private async testSupabaseConnection() {
    try {
      const { data, error } = await this.supabaseService.client
        .from('courses')
        .select('count');

      if (error) {
        console.error('❌ Supabase connection failed:', error);
      } else {
        console.log('✅ Supabase connected successfully!');
        console.log('📊 Courses table is accessible');
      }
    } catch (err) {
      console.error('❌ Supabase connection error:', err);
    }
  }
}
