import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  FileText,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-angular';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
})
export class TermsComponent {
  FileText = FileText;
  AlertCircle = AlertCircle;
  CheckCircle2 = CheckCircle2;
  Shield = Shield;

  lastUpdated = 'November 30, 2025';
}
