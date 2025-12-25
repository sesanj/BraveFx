import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Shield,
  CheckCircle,
  Lock,
  RefreshCw,
  Mail,
} from 'lucide-angular';

@Component({
  selector: 'app-guarantee',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './guarantee.component.html',
  styleUrl: './guarantee.component.css',
})
export class GuaranteeComponent {
  readonly Shield = Shield;
  readonly CheckCircle = CheckCircle;
  readonly Lock = Lock;
  readonly RefreshCw = RefreshCw;
  readonly Mail = Mail;

  refundSteps = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Contact support within 30 days',
    },
    {
      icon: RefreshCw,
      title: 'Request Refund',
      description: 'We process your request immediately',
    },
    {
      icon: CheckCircle,
      title: 'Get Your Money Back',
      description: 'Full refund within 5-7 business days',
    },
  ];

  trustBadges = [
    { text: 'Secure Checkout' },
    { text: 'SSL Encrypted' },
    { text: 'Money-Back Guarantee' },
    { text: '24/7 Support' },
  ];
}
