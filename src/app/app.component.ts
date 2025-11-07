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

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Hide header/footer on course player and dashboard routes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showHeaderFooter =
          !event.url.includes('/course/') && !event.url.includes('/dashboard');
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
