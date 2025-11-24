import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

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
  createStripePayment(
    amount: number,
    currency: string
  ): Observable<PaymentIntent> {
    // Dummy Stripe payment - will integrate real Stripe later
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next({
          id: 'pi_' + Date.now(),
          amount,
          currency,
          status: 'succeeded',
        });
        observer.complete();
      }, 2000);
    });
  }

  createPaystackPayment(
    amount: number,
    email: string
  ): Observable<PaymentIntent> {
    // Dummy Paystack payment - will integrate real Paystack later
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next({
          id: 'ps_' + Date.now(),
          amount,
          currency: 'NGN',
          status: 'succeeded',
        });
        observer.complete();
      }, 2000);
    });
  }

  verifyPayment(paymentId: string): Observable<boolean> {
    return of(true);
  }
}
