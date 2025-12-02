import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-angular';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css'],
})
export class PrivacyPolicyComponent {
  Shield = Shield;
  Lock = Lock;
  Eye = Eye;
  Database = Database;
  UserCheck = UserCheck;
  AlertCircle = AlertCircle;
  CheckCircle2 = CheckCircle2;

  lastUpdated = 'November 30, 2025';
}
