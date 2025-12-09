import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Clock, Sparkles } from 'lucide-angular';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-sticky-campaign-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './sticky-campaign-bar.component.html',
  styleUrls: ['./sticky-campaign-bar.component.css'],
  animations: [
    trigger('slideDown', [
      state(
        'hidden',
        style({
          transform: 'translateY(-100%)',
          opacity: 0,
        })
      ),
      state(
        'visible',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition(
        'hidden <=> visible',
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
      ),
    ]),
  ],
})
export class StickyCampaignBarComponent implements OnInit, OnDestroy {
  @Input() campaignCode: string = '';
  @Input() discountText: string = '';
  @Input() expiresAt: string = '';

  isVisible = false;
  private campaignBannerElement?: HTMLElement;

  // Countdown state
  timeRemaining = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  private countdownInterval?: number;

  // Icons
  Clock = Clock;
  Sparkles = Sparkles;

  ngOnInit() {
    if (this.expiresAt) {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    // Get the campaign banner element
    if (!this.campaignBannerElement) {
      this.campaignBannerElement = document.querySelector(
        '.campaign-banner'
      ) as HTMLElement;
    }

    if (this.campaignBannerElement) {
      const rect = this.campaignBannerElement.getBoundingClientRect();

      // Show sticky bar when campaign banner is scrolled past
      // Add 100px buffer so it appears smoothly
      this.isVisible = rect.bottom < 100;
    }
  }

  /**
   * Start countdown timer
   */
  startCountdown() {
    if (!this.expiresAt) return;

    // Update immediately
    this.updateCountdown();

    // Then update every second
    this.countdownInterval = window.setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }

  /**
   * Update countdown values
   */
  updateCountdown() {
    if (!this.expiresAt) return;

    const now = new Date().getTime();
    const expiry = new Date(this.expiresAt).getTime();
    const distance = expiry - now;

    if (distance <= 0) {
      this.stopCountdown();
      return;
    }

    this.timeRemaining = {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
  }

  /**
   * Stop countdown timer
   */
  stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
  }

  /**
   * Scroll to pricing section
   */
  scrollToPricing() {
    const pricingSection = document.getElementById('enroll');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Format number with leading zero
   */
  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
