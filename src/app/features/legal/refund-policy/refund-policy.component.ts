import { Component } from '@angular/core';
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
} from 'lucide-angular';

@Component({
  selector: 'app-refund-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './refund-policy.component.html',
  styleUrls: ['./refund-policy.component.css'],
})
export class RefundPolicyComponent {
  DollarSign = DollarSign;
  CheckCircle2 = CheckCircle2;
  XCircle = XCircle;
  Clock = Clock;
  Mail = Mail;
  Shield = Shield;
  AlertCircle = AlertCircle;

  lastUpdated = 'November 30, 2025';
}
