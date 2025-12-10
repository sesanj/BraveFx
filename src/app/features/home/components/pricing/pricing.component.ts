import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Sparkles,
  Award,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  PlayCircle,
  Infinity,
  MessageCircle,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  Plus,
  Minus,
  Tag,
} from 'lucide-angular';
import {
  CouponService,
  Coupon,
} from '../../../../core/services/coupon.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EnrollmentService } from '../../../../core/services/enrollment.service';

export interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
})
export class PricingComponent implements OnInit {
  // Pricing
  readonly originalPrice = 149; // Actual course price
  activeCoupon: Coupon | null = null;
  isCheckingCoupon = true;

  // Enrollment state
  isUserEnrolled = false;
  isCheckingEnrollment = true;

  // Computed pricing
  get discountAmount(): number {
    if (!this.activeCoupon) return 0;

    if (this.activeCoupon.discount_type === 'percentage') {
      return (this.originalPrice * this.activeCoupon.discount_value) / 100;
    } else {
      return Math.min(this.activeCoupon.discount_value, this.originalPrice);
    }
  }

  get finalPrice(): number {
    return Math.max(0, this.originalPrice - this.discountAmount);
  }

  get totalSavings(): number {
    return this.discountAmount;
  }

  get discountBadgeText(): string {
    if (!this.activeCoupon) return '';

    if (this.activeCoupon.discount_type === 'percentage') {
      return `${this.activeCoupon.discount_value}% OFF`;
    } else {
      return `$${this.activeCoupon.discount_value} OFF`;
    }
  }
  // Component owns its FAQs data and state
  faqs: FAQ[] = [
    {
      question: 'Is this course suitable for complete beginners?',
      answer:
        'Absolutely! This course is designed to take you from zero knowledge to confident trader. We start with the basics and progressively build your skills. No prior trading experience required.',
      isOpen: false,
    },
    {
      question: 'How long do I have access to the course?',
      answer:
        "You get lifetime access to all course materials. Plus, you'll receive all future updates and new content at no additional cost. Learn at your own pace, whenever suits you best.",
      isOpen: false,
    },
    {
      question: 'What if I am not satisfied with the course?',
      answer:
        'We offer a 30-day money-back guarantee. If you are not completely satisfied, just email us and we will refund your purchase—no questions asked.',
      isOpen: false,
    },
    {
      question: 'Do I need expensive software or tools?',
      answer:
        "No! We'll show you how to use free charting platforms and explain what you actually need. You don't need to spend thousands on software to be successful.",
      isOpen: false,
    },
    {
      question: 'How much time do I need to commit?',
      answer:
        'You can go at your own pace. Some students finish in a few weeks, others prefer to spread it over months. Each lesson is bite-sized (10-20 minutes), so you can fit learning around your schedule.',
      isOpen: false,
    },
  ];

  // Icons
  Sparkles = Sparkles;
  Award = Award;
  ArrowRight = ArrowRight;
  Shield = Shield;
  Lock = Lock;
  Zap = Zap;
  PlayCircle = PlayCircle;
  Infinity = Infinity;
  MessageCircle = MessageCircle;
  ClipboardCheck = ClipboardCheck;
  FileText = FileText;
  CheckCircle = CheckCircle;
  Smartphone = Smartphone;
  ShieldCheck = ShieldCheck;
  Plus = Plus;
  Minus = Minus;
  Tag = Tag;

  constructor(
    private couponService: CouponService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService
  ) {}

  async ngOnInit() {
    // Wait for auth to initialize before checking enrollment
    await this.authService.waitForAuthInit();

    await Promise.all([
      this.checkForActiveCoupon(),
      this.checkUserEnrollment(),
    ]);
  }

  /**
   * Check if the current user is enrolled in any course
   */
  async checkUserEnrollment() {
    try {
      const user = this.authService.getCurrentUser();

      console.log(
        '👤 [Pricing] Current user:',
        user ? user.email : 'Not logged in'
      );

      if (!user) {
        this.isUserEnrolled = false;
        this.isCheckingEnrollment = false;
        console.log(
          '❌ [Pricing] No user logged in - showing Enroll Now button'
        );
        return;
      }

      // Check if user has any active enrollments
      const enrollments = await this.enrollmentService.getUserEnrollments(
        user.id
      );
      this.isUserEnrolled = enrollments.length > 0;

      console.log('📚 [Pricing] User enrollment status:', this.isUserEnrolled);
      console.log('📚 [Pricing] Enrollments found:', enrollments.length);
      console.log(
        '🎯 [Pricing] Will show:',
        this.isUserEnrolled ? 'START LEARNING button' : 'ENROLL NOW button'
      );
    } catch (error) {
      console.error('❌ [Pricing] Error checking enrollment:', error);
      this.isUserEnrolled = false;
    } finally {
      this.isCheckingEnrollment = false;
    }
  }

  /**
   * Check for active coupon with priority:
   * 1. Site-wide campaign (is_default = true) - HIGHEST PRIORITY
   * 2. Specific coupon from URL/localStorage
   * 3. No discount
   */
  async checkForActiveCoupon() {
    try {
      // FIRST: Check for site-wide campaign (overrides everything)
      const defaultCoupon = await this.couponService.getDefaultCoupon();

      if (defaultCoupon) {
        console.log(
          '🎯 [Pricing] Site-wide campaign active:',
          defaultCoupon.code
        );
        const result = await this.couponService.validateCoupon(
          defaultCoupon.code,
          this.originalPrice
        );

        if (result.valid && result.coupon) {
          this.activeCoupon = result.coupon;
          this.isCheckingCoupon = false;
          return; // Site-wide campaign takes precedence
        }
      }

      // SECOND: If no site-wide campaign, check for specific coupon in localStorage
      const pendingCoupon = localStorage.getItem('bravefx_pending_coupon');

      if (pendingCoupon) {
        const result = await this.couponService.validateCoupon(
          pendingCoupon,
          this.originalPrice
        );

        if (result.valid && result.coupon) {
          this.activeCoupon = result.coupon;
          console.log(
            '✅ [Pricing] Specific coupon found:',
            this.activeCoupon.code
          );
        } else {
          console.log('⚠️ [Pricing] Coupon in storage is invalid, removing...');
          localStorage.removeItem('bravefx_pending_coupon');
        }
      }
    } catch (error) {
      console.error('❌ [Pricing] Error checking for coupons:', error);
    } finally {
      this.isCheckingCoupon = false;
    }
  }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
