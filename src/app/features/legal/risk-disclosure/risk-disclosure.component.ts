import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Shield,
  CheckCircle2,
  XCircle,
  Info,
  BookOpen,
} from 'lucide-angular';

@Component({
  selector: 'app-risk-disclosure',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './risk-disclosure.component.html',
  styleUrls: ['./risk-disclosure.component.css'],
})
export class RiskDisclosureComponent {
  AlertTriangle = AlertTriangle;
  TrendingDown = TrendingDown;
  DollarSign = DollarSign;
  Shield = Shield;
  CheckCircle2 = CheckCircle2;
  XCircle = XCircle;
  Info = Info;
  BookOpen = BookOpen;

  lastUpdated = 'November 30, 2025';
}
