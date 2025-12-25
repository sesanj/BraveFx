import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SupabaseService } from './core/services/supabase.service';
// import { TawkService } from './core/services/tawk.service';
import { AuthService } from './core/services/auth.service';

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
    private route: ActivatedRoute,
    private supabase: SupabaseService,
    // private tawkService: TawkService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // // Set visitor info when user logs in
    // this.authService.currentUser$.subscribe((user) => {
    //   if (user && user.email) {
    //     // Get user's name from profile if available
    //     this.supabase.client
    //       .from('profiles')
    //       .select('full_name')
    //       .eq('id', user.id)
    //       .single()
    //       .then(({ data }) => {
    //         const name =
    //           data?.full_name || user.email?.split('@')[0] || 'Student';
    //         this.tawkService.setVisitor(name, user.email!);
    //       });
    //   }
    // });

    // Hide header/footer on course player, dashboard, and admin routes
    // Hide only footer on auth routes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const isCoursePage = event.url.includes('/course/');
        const isDashboard = event.url.includes('/dashboard');
        const isAdminPage = event.url.includes('/admin');
        const isCheckoutPage = event.url.includes('/checkout');
        const isAuthPage =
          event.url.includes('/login') ||
          event.url.includes('/register') ||
          event.url.includes('/reset-password');

        // Hide both header and footer on course player, dashboard, admin, and checkout
        this.showHeaderFooter =
          !isCoursePage && !isDashboard && !isAdminPage && !isCheckoutPage;

        // Show header on auth pages, but hide on checkout, course, dashboard, and admin
        this.showHeader =
          !isCoursePage && !isDashboard && !isAdminPage && !isCheckoutPage;
        this.showFooter =
          !isCoursePage &&
          !isDashboard &&
          !isAuthPage &&
          !isAdminPage &&
          !isCheckoutPage;

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
      const { data, error } = await this.supabase.client
        .from('courses')
        .select('count');

      if (error) {
      } else {
      }
    } catch (err) {}
  }
}
