import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
  CreditCard,
  Mail,
  GraduationCap,
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
  // Expose Math for template
  Math = Math;

  // Pricing
  readonly originalPrice = 99; // Actual course price
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
  CreditCard = CreditCard;
  Mail = Mail;
  GraduationCap = GraduationCap;

  constructor(
    private couponService: CouponService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private route: ActivatedRoute
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

      if (!user) {
        this.isUserEnrolled = false;
        this.isCheckingEnrollment = false;
        return;
      }

      // Check if user has any active enrollments
      const enrollments = await this.enrollmentService.getUserEnrollments(
        user.id
      );
      this.isUserEnrolled = enrollments.length > 0;
    } catch (error) {
      this.isUserEnrolled = false;
    } finally {
      this.isCheckingEnrollment = false;
    }
  }

  /**
   * Check for active coupon with priority:
   * 1. URL parameter (freshest intent from ads/links) - HIGHEST PRIORITY
   * 2. localStorage (return visitor with saved code)
   * 3. Site-wide campaign (fallback for special occasions)
   */
  async checkForActiveCoupon() {
    try {
      // FIRST: Check URL for coupon parameter
      const urlCoupon = this.route.snapshot.queryParamMap.get('coupon');

      if (urlCoupon) {
        const result = await this.couponService.validateCoupon(
          urlCoupon,
          this.originalPrice
        );

        if (result.valid && result.coupon) {
          // Save to localStorage (overwrites any existing coupon)
          localStorage.setItem('bravefx_pending_coupon', urlCoupon);
          this.activeCoupon = result.coupon;
          this.isCheckingCoupon = false;
          return; // URL coupon takes highest priority
        } else {
          // Invalid URL coupon - remove from localStorage if it exists
          localStorage.removeItem('bravefx_pending_coupon');
        }
      }

      // SECOND: Check localStorage for saved coupon
      const savedCoupon = localStorage.getItem('bravefx_pending_coupon');

      if (savedCoupon) {
        const result = await this.couponService.validateCoupon(
          savedCoupon,
          this.originalPrice
        );

        if (result.valid && result.coupon) {
          this.activeCoupon = result.coupon;
          this.isCheckingCoupon = false;
          return; // localStorage coupon takes second priority
        } else {
          // Invalid saved coupon - remove it
          localStorage.removeItem('bravefx_pending_coupon');
        }
      }

      // THIRD: Fall back to site-wide campaign (if neither URL nor localStorage exist)
      const defaultCoupon = await this.couponService.getDefaultCoupon();

      if (defaultCoupon) {
        const result = await this.couponService.validateCoupon(
          defaultCoupon.code,
          this.originalPrice
        );

        if (result.valid && result.coupon) {
          this.activeCoupon = result.coupon;
        }
      }
    } catch (error) {
      console.error('Error checking for active coupon:', error);
    } finally {
      this.isCheckingCoupon = false;
    }
  }

  toggleFaq(index: number): void {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
