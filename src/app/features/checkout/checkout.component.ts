import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { AuthService } from '../../core/services/auth.service';
import { CourseService } from '../../core/services/course.service';
import { SeoService } from '../../core/services/seo.service';
import { StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
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
  coursePrice: number = 0; // Will be fetched from database
  courseName: string = 'Loading...'; // Will be fetched from database
  courseId: string = ''; // Will be fetched from database
  courseThumbnail: string = ''; // Will be fetched from database
  courseDescription: string = ''; // Will be fetched from database

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router,
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

      // Convert price to cents (Stripe expects cents)
      const amountInCents = Math.round(this.coursePrice * 100);
      console.log(
        '💰 [Checkout] Processing payment for:',
        this.coursePrice,
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
        this.courseId, // Pass the actual course ID from database
        amountInCents // Pass the actual amount charged
      );

      if (!enrollResult.success) {
        throw new Error(enrollResult.error || 'Account creation failed');
      }

      // 4. Try to sign in the user
      try {
        await this.authService.signIn(this.email, this.password);

        // 5. Show success and redirect
        this.successMessage =
          'Payment successful! Redirecting to your dashboard...';

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
  }
}
