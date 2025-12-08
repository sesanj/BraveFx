import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { CouponService, Coupon } from '../../core/services/coupon.service';
import { SeoService } from '../../core/services/seo.service';
import { StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  animations: [
    trigger('slideNotification', [
      transition(':enter', [
        style({ transform: 'translateY(-150%)', opacity: 0 }),
        animate(
          '400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ transform: 'translateY(-150%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('cardNumber', { static: false }) cardNumberRef!: ElementRef;
  @ViewChild('cardExpiry', { static: false }) cardExpiryRef!: ElementRef;
  @ViewChild('cardCvc', { static: false }) cardCvcRef!: ElementRef;

  // Form data
  fullName: string = '';
  email: string = '';
  password: string = '';
  agreeToTerms: boolean = false;

  // UI State
  isProcessing: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;

  // Coupon State
  isValidatingCoupon: boolean = false;
  appliedCoupon: Coupon | null = null;
  couponMessage: string = '';
  couponMessageType: 'success' | 'error' | '' = '';
  showCouponMessage: boolean = false;

  // Validation
  emailError: string = '';
  passwordError: string = '';
  nameError: string = '';

  // Stripe
  private cardNumberElement: any = null;
  private cardExpiryElement: any = null;
  private cardCvcElement: any = null;
  cardError: string = '';

  // Course info - loaded from database
  coursePrice: number = 0; // Original price from database
  courseName: string = 'Loading...';
  courseId: string = '';
  courseThumbnail: string = '';
  courseDescription: string = '';

  // Campaign countdown state
  isSiteWideCampaign: boolean = false;
  campaignTimeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private countdownInterval: any = null;

  // Computed properties for pricing
  get discountAmount(): number {
    if (!this.appliedCoupon) return 0;

    if (this.appliedCoupon.discount_type === 'percentage') {
      return (this.coursePrice * this.appliedCoupon.discount_value) / 100;
    } else {
      return Math.min(this.appliedCoupon.discount_value, this.coursePrice);
    }
  }

  get finalPrice(): number {
    return Math.max(0, this.coursePrice - this.discountAmount);
  }

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private courseService: CourseService,
    private couponService: CouponService,
    private router: Router,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {}

  async ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'Enroll Now - BraveFx Forex Trading Course',
      description:
        'Join 6,000+ students mastering forex trading. $49.99 one-time payment for lifetime access. 30-day money-back guarantee.',
      keywords:
        'enroll forex course, buy forex course, forex training, trading education',
      url: 'https://bravefx.io/checkout',
      image: 'https://bravefx.io/assets/og-image.jpg',
    });

    // Check if user is already logged in
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.router.navigate(['/dashboard']);
    }

    // Fetch the course to get its ID
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        if (courses && courses.length > 0) {
          // Get the first course (BraveFX - since you only have one)
          this.courseId = courses[0].id;
          this.courseName = courses[0].title;
          this.coursePrice = courses[0].price;
          this.courseThumbnail = courses[0].thumbnail;
          this.courseDescription = courses[0].description;
          console.log(
            '📚 [Checkout] Loaded course:',
            this.courseId,
            this.courseName
          );

          // Check for coupon in URL after course is loaded
          this.checkForCouponInUrl();
        } else {
          console.error('❌ [Checkout] No courses found in database');
          this.errorMessage = 'Course not found. Please contact support.';
        }
      },
      error: (error) => {
        console.error('❌ [Checkout] Error loading course:', error);
        this.errorMessage = 'Failed to load course. Please try again.';
      },
    });

    // Initialize Stripe
    await this.paymentService.initializeStripe();
  }

  async ngAfterViewInit() {
    // Mount card elements after view is ready
    await this.mountCardElements();
  }

  async mountCardElements() {
    if (this.cardNumberRef && this.cardExpiryRef && this.cardCvcRef) {
      const elements = await this.paymentService.createSeparateCardElements();

      if (elements) {
        this.cardNumberElement = elements.cardNumber;
        this.cardExpiryElement = elements.cardExpiry;
        this.cardCvcElement = elements.cardCvc;

        // Mount elements
        this.cardNumberElement.mount(this.cardNumberRef.nativeElement);
        this.cardExpiryElement.mount(this.cardExpiryRef.nativeElement);
        this.cardCvcElement.mount(this.cardCvcRef.nativeElement);

        // Listen for errors on any element
        this.cardNumberElement.on('change', (event: any) => {
          this.cardError = event.error ? event.error.message : '';
        });
        this.cardExpiryElement.on('change', (event: any) => {
          if (event.error) this.cardError = event.error.message;
        });
        this.cardCvcElement.on('change', (event: any) => {
          if (event.error) this.cardError = event.error.message;
        });
      }
    }
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email) {
      this.emailError = 'Email is required';
      return false;
    }
    if (!emailRegex.test(this.email)) {
      this.emailError = 'Please enter a valid email address';
      return false;
    }
    this.emailError = '';
    return true;
  }

  validatePassword(): boolean {
    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }
    if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
      return false;
    }
    this.passwordError = '';
    return true;
  }

  validateName(): boolean {
    if (!this.fullName || this.fullName.trim().length < 2) {
      this.nameError = 'Please enter your full name';
      return false;
    }
    this.nameError = '';
    return true;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Check for pending coupon with priority:
   * 1. Site-wide campaign (is_default = true) - HIGHEST PRIORITY
   * 2. Specific coupon from localStorage or URL
   * 3. No discount
   */
  async checkForCouponInUrl() {
    console.log('🔍 [Checkout] Checking for active coupons...');

    try {
      // FIRST: Check for site-wide campaign (overrides everything)
      const defaultCoupon = await this.couponService.getDefaultCoupon();

      if (defaultCoupon) {
        console.log(
          '🎯 [Checkout] Site-wide campaign active:',
          defaultCoupon.code
        );

        // Mark as site-wide campaign and start countdown
        this.isSiteWideCampaign = true;
        this.startCampaignCountdown(defaultCoupon.expires_at);

        // Show loading overlay
        this.isValidatingCoupon = true;

        // Validate with minimum 2-second delay for UX
        const [result] = await Promise.all([
          this.couponService.validateCoupon(
            defaultCoupon.code,
            this.coursePrice
          ),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);

        this.isValidatingCoupon = false;

        if (result.valid && result.coupon) {
          this.appliedCoupon = result.coupon;

          let discountText = '';
          if (result.coupon.discount_type === 'percentage') {
            discountText = `${result.coupon.discount_value}% Off`;
          } else {
            discountText = `$${result.coupon.discount_value} Off`;
          }

          this.showCouponNotification(
            `🎉 ${discountText} Applied! - Save $${result.discountAmount?.toFixed(
              2
            )}`,
            'success'
          );
          return; // Site-wide campaign takes precedence
        }
      }

      // SECOND: If no site-wide campaign, check for specific coupon
      const pendingCoupon = localStorage.getItem('bravefx_pending_coupon');
      const urlCoupon = this.route.snapshot.queryParamMap.get('coupon');
      const couponCode = pendingCoupon || urlCoupon;

      if (!couponCode) {
        console.log('ℹ️ [Checkout] No pending coupon found');
        return;
      }

      console.log(
        '🎟️ [Checkout] Specific coupon code found:',
        couponCode,
        pendingCoupon ? '(from storage)' : '(from URL)'
      );

      // Show loading overlay
      this.isValidatingCoupon = true;

      // Start validation and minimum delay in parallel
      const [result] = await Promise.all([
        this.couponService.validateCoupon(couponCode, this.coursePrice),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      this.isValidatingCoupon = false;

      if (result.valid && result.coupon) {
        // Success - Apply coupon
        this.appliedCoupon = result.coupon;

        let discountText = '';
        if (result.coupon.discount_type === 'percentage') {
          discountText = `${result.coupon.discount_value}% Off`;
        } else {
          discountText = `$${result.coupon.discount_value} Off`;
        }

        this.showCouponNotification(
          `🎉 ${discountText} Applied! You save $${result.discountAmount?.toFixed(
            2
          )}`,
          'success'
        );
        console.log(
          '✅ [Checkout] Coupon applied successfully:',
          this.appliedCoupon
        );
      } else {
        // Invalid coupon - remove from storage
        console.warn('❌ [Checkout] Coupon validation failed:', result.error);
        localStorage.removeItem('bravefx_pending_coupon');
        console.log('🗑️ [Checkout] Removed invalid coupon from localStorage');

        this.showCouponNotification(
          `⚠️ Coupon "${couponCode}" is invalid or expired`,
          'error'
        );
      }
    } catch (error) {
      this.isValidatingCoupon = false;
      console.error('❌ [Checkout] Error checking for coupons:', error);
      this.showCouponNotification(
        `⚠️ Error validating coupon. Please refresh and try again.`,
        'error'
      );
    }
  }

  /**
   * Show coupon notification banner
   */
  showCouponNotification(message: string, type: 'success' | 'error') {
    this.couponMessage = message;
    this.couponMessageType = type;
    this.showCouponMessage = true;

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      this.showCouponMessage = false;
    }, 5000);
  }

  /**
   * Manually dismiss coupon notification
   */
  dismissCouponNotification() {
    this.showCouponMessage = false;
  }

  async processPayment() {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.errorMessage = '';
    this.cardError = '';

    try {
      // Validate all fields before processing
      const emailValid = this.validateEmail();
      const passwordValid = this.validatePassword();
      const nameValid = this.validateName();

      if (!emailValid || !passwordValid || !nameValid) {
        this.isProcessing = false;
        return;
      }

      if (!this.agreeToTerms) {
        this.errorMessage = 'Please accept the terms and conditions';
        this.isProcessing = false;
        return;
      }

      // Check if email already exists
      const { data: existingUser } = await this.authService.checkEmailExists(
        this.email
      );
      if (existingUser) {
        this.emailError = 'An account with this email already exists';
        this.isProcessing = false;
        return;
      }

      // Verify we have a course loaded with a valid price
      if (!this.courseId || !this.coursePrice) {
        throw new Error('Course not loaded. Please refresh the page.');
      }

      // Use final price (with discount applied if coupon exists)
      const amountInCents = Math.round(this.finalPrice * 100);
      console.log(
        '💰 [Checkout] Processing payment:',
        'Original:',
        this.coursePrice,
        'Final:',
        this.finalPrice,
        'Discount:',
        this.discountAmount,
        '(',
        amountInCents,
        'cents)'
      );

      // 1. Create Payment Intent with actual course price from database
      const paymentIntent = await this.paymentService.createPaymentIntent(
        amountInCents
      );

      if (!paymentIntent || !paymentIntent.clientSecret) {
        throw new Error('Failed to initialize payment. Please try again.');
      }

      // 2. Confirm Card Payment
      const paymentResult = await this.paymentService.confirmCardPayment(
        paymentIntent.clientSecret,
        this.email,
        this.fullName
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // 3. Create User Account and Enroll with actual course price
      const enrollResult = await this.paymentService.createUserAndEnroll(
        this.email,
        this.password,
        this.fullName,
        paymentResult.paymentIntentId!,
        this.courseId,
        amountInCents
      );

      if (!enrollResult.success) {
        throw new Error(enrollResult.error || 'Account creation failed');
      }

      // 4. Sign in the user first (needed for RLS policies)
      try {
        await this.authService.signIn(this.email, this.password);
        console.log('✅ [Checkout] User signed in successfully');

        // 5. Record coupon redemption AFTER user is authenticated
        if (
          this.appliedCoupon &&
          enrollResult.userId &&
          enrollResult.enrollmentId
        ) {
          console.log('💾 [Checkout] Recording coupon redemption...', {
            couponId: this.appliedCoupon.id,
            userId: enrollResult.userId,
            enrollmentId: enrollResult.enrollmentId,
            amountSaved: this.discountAmount,
          });

          const redemptionResult = await this.couponService.recordRedemption(
            this.appliedCoupon.id,
            enrollResult.userId,
            enrollResult.enrollmentId,
            this.discountAmount
          );

          if (redemptionResult.success) {
            console.log(
              '✅ [Checkout] Coupon redemption recorded successfully'
            );

            // NOW remove coupon from localStorage - payment successful, coupon redeemed
            localStorage.removeItem('bravefx_pending_coupon');
            console.log(
              '🗑️ [Checkout] Removed coupon from localStorage (payment successful)'
            );
          } else {
            console.error(
              '❌ [Checkout] Failed to record coupon redemption:',
              redemptionResult.error
            );
          }
        }

        // 6. Show success and redirect
        this.successMessage =
          'Payment successful! Redirecting to your dashboard...';

        // Clear coupon from localStorage even if no coupon was used (cleanup)
        localStorage.removeItem('bravefx_pending_coupon');

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      } catch (signInError: any) {
        // If sign-in fails (likely due to email confirmation requirement)
        console.log('Sign-in after payment failed:', signInError);
        this.successMessage =
          'Payment successful! Please check your email to confirm your account, then sign in.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 4000);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      this.errorMessage =
        error.message || 'Payment processing failed. Please try again.';
    } finally {
      this.isProcessing = false;
    }
  }

  ngOnDestroy() {
    this.paymentService.destroyCardElement();
    this.stopCampaignCountdown();
  }

  /**
   * Start countdown timer for site-wide campaign
   */
  startCampaignCountdown(expiresAt: string | null) {
    if (!expiresAt) return;

    this.stopCampaignCountdown(); // Clear any existing interval

    // Update immediately
    this.updateCampaignCountdown(expiresAt);

    // Then update every second
    this.countdownInterval = setInterval(() => {
      this.updateCampaignCountdown(expiresAt);
    }, 1000);
  }

  /**
   * Update countdown timer values
   */
  updateCampaignCountdown(expiresAt: string) {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const distance = expiry - now;

    if (distance < 0) {
      // Campaign expired - hide countdown
      this.stopCampaignCountdown();
      this.isSiteWideCampaign = false;
      this.campaignTimeRemaining = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
      return;
    }

    // Calculate time units
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    this.campaignTimeRemaining = { days, hours, minutes, seconds };
  }

  /**
   * Stop countdown timer
   */
  stopCampaignCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Format time with leading zero
   */
  formatTime(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
