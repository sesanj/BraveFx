import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Shield,
  AlertCircle,
  Monitor,
  ArrowRight,
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './refund-policy.component.html',
  styleUrls: ['./refund-policy.component.css'],
})
export class RefundPolicyComponent implements OnInit {
  DollarSign = DollarSign;
  CheckCircle2 = CheckCircle2;
  XCircle = XCircle;
  Clock = Clock;
  Mail = Mail;
  Shield = Shield;
  AlertCircle = AlertCircle;
  Monitor = Monitor;
  ArrowRight = ArrowRight;

  lastUpdated = 'December 8, 2025';
  isLoggedIn = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Check if user is logged in to show dashboard link
    this.authService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }
}
