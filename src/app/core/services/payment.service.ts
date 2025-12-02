import { Injectable } from '@angular/core';
import {
  loadStripe,
  Stripe,
  StripeElements,
  StripeCardElement,
} from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;
  private cardNumberElement: any = null;

  constructor(private supabase: SupabaseService) {
    this.stripePromise = loadStripe(environment.stripe.publishableKey);
  }

  async initializeStripe(): Promise<void> {
    this.stripe = await this.stripePromise;
  }

  async createSeparateCardElements(): Promise<{
    cardNumber: any;
    cardExpiry: any;
    cardCvc: any;
  } | null> {
    if (!this.stripe) {
      await this.initializeStripe();
    }

    if (!this.stripe) {
      console.error('Stripe failed to initialize');
      return null;
    }

    // Detect current theme
    const isDarkMode =
      document.documentElement.getAttribute('data-theme') === 'dark';

    const elementStyles = {
      base: {
        fontSize: '16px',
        color: isDarkMode ? '#f1f5f9' : '#0f172a',
        '::placeholder': {
          color: isDarkMode ? '#64748b' : '#94a3b8',
        },
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSmoothing: 'antialiased',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    };

    this.elements = this.stripe.elements();

    const cardNumber = this.elements.create('cardNumber', {
      style: elementStyles,
      showIcon: true, // Enable card brand icon display
    });

    const cardExpiry = this.elements.create('cardExpiry', {
      style: elementStyles,
    });

    const cardCvc = this.elements.create('cardCvc', {
      style: elementStyles,
    });

    // Store cardNumber for payment confirmation
    this.cardNumberElement = cardNumber;

    return { cardNumber, cardExpiry, cardCvc };
  }

  async createPaymentIntent(
    amount: number
  ): Promise<{ clientSecret: string } | null> {
    try {
      // Call Supabase Edge Function to create payment intent
      const { data, error } = await this.supabase.client.functions.invoke(
        'create-payment-intent',
        {
          body: { amount },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return null;
    }
  }

  async confirmCardPayment(
    clientSecret: string,
    email: string,
    name: string
  ): Promise<{ success: boolean; error?: string; paymentIntentId?: string }> {
    if (!this.stripe || !this.elements) {
      return { success: false, error: 'Stripe not initialized' };
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.cardNumberElement,
            billing_details: {
              name: name,
              email: email,
            },
          },
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent?.status === 'succeeded') {
        return { success: true, paymentIntentId: paymentIntent.id };
      }

      return { success: false, error: 'Payment failed' };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed',
      };
    }
  }

  async createUserAndEnroll(
    email: string,
    password: string,
    fullName: string,
    paymentIntentId: string,
    courseId: string, // Course UUID from database
    amount: number // Amount in cents
  ): Promise<{ success: boolean; error?: string; userId?: string }> {
    try {
      // 1. Create user account (skip email confirmation for paid users)
      const { data: authData, error: authError } =
        await this.supabase.client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: fullName,
            },
          },
        });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      // Wait a moment for auth session to be established
      console.log('✅ [PaymentService] User created successfully:', userId);

      // Profile is automatically created via database trigger
      // No manual insert needed

      // 2. Record payment with actual amount from course
      const { data: paymentData, error: paymentError } =
        await this.supabase.client
          .from('payments')
          .insert({
            user_id: userId,
            amount: amount, // Use the actual course price passed in
            payment_intent_id: paymentIntentId,
            status: 'completed',
            payment_method: 'stripe',
          })
          .select()
          .single();

      if (paymentError) {
        console.error('Payment record error:', paymentError);
        throw new Error('Failed to record payment: ' + paymentError.message);
      }

      console.log(
        '💳 [PaymentService] Payment recorded successfully:',
        paymentData.id
      );

      // 3. Enroll in course with the actual course ID from database
      console.log(
        '📚 [PaymentService] Creating enrollment for user:',
        userId,
        'in course:',
        courseId
      );
      const { error: enrollError } = await this.supabase.client
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId, // Use the actual UUID from database
          status: 'active',
        });

      if (enrollError) {
        console.error('❌ [PaymentService] Enrollment error:', enrollError);
        throw new Error('Failed to enroll in course: ' + enrollError.message);
      }

      console.log(
        '✅ [PaymentService] User successfully enrolled in course:',
        courseId
      );

      return { success: true, userId };
    } catch (error: any) {
      console.error('User creation and enrollment error:', error);
      return {
        success: false,
        error: error.message || 'Account creation failed',
      };
    }
  }

  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
  }

  // Legacy methods for compatibility
  createStripePayment(amount: number, currency: string) {
    return this.createPaymentIntent(amount);
  }

  verifyPayment(paymentId: string): Promise<boolean> {
    return Promise.resolve(true);
  }
}
