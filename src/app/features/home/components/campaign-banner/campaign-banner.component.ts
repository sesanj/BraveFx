import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Zap, Clock } from 'lucide-angular';
import {
  CouponService,
  Coupon,
} from '../../../../core/services/coupon.service';

@Component({
  selector: 'app-campaign-banner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './campaign-banner.component.html',
  styleUrls: ['./campaign-banner.component.css'],
})
export class CampaignBannerComponent implements OnInit, OnDestroy {
  activeCampaign: Coupon | null = null;
  isLoading = true;

  // Countdown state
  timeRemaining = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  private countdownInterval?: number;

  // Icons
  Zap = Zap;
  Clock = Clock;

  constructor(private couponService: CouponService) {}

  async ngOnInit() {
    await this.loadCampaign();

    if (this.activeCampaign?.expires_at) {
      this.startCountdown();
    }
  }

  ngOnDestroy() {
    this.stopCountdown();
  }

  /**
   * Load active site-wide campaign
   */
  async loadCampaign() {
    try {
      const campaign = await this.couponService.getDefaultCoupon();

      if (campaign && campaign.expires_at) {
        this.activeCampaign = campaign;
        console.log('🎯 [Campaign Banner] Active campaign:', campaign.code);
      }
    } catch (error) {
      console.error('❌ [Campaign Banner] Error loading campaign:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Start countdown timer
   */
  startCountdown() {
    if (!this.activeCampaign?.expires_at) return;

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
    if (!this.activeCampaign?.expires_at) return;

    const now = new Date().getTime();
    const expiry = new Date(this.activeCampaign.expires_at).getTime();
    const distance = expiry - now;

    if (distance <= 0) {
      this.stopCountdown();
      this.activeCampaign = null; // Hide banner when expired
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
   * Get discount text for display
   */
  get discountText(): string {
    if (!this.activeCampaign) return '';

    if (this.activeCampaign.discount_type === 'percentage') {
      return `${this.activeCampaign.discount_value}% OFF`;
    } else {
      return `$${this.activeCampaign.discount_value} OFF`;
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
