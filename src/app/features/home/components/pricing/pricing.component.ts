import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Sparkles,
  Award,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  PlayCircle,
  Infinity,
  MessageCircle,
  ClipboardCheck,
  FileText,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-angular';

export interface FAQ {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
})
export class PricingComponent {
  @Input() faqs: FAQ[] = [];
  @Output() toggleFaqEvent = new EventEmitter<number>();

  // Icons
  Sparkles = Sparkles;
  Award = Award;
  ArrowRight = ArrowRight;
  Shield = Shield;
  Lock = Lock;
  Zap = Zap;
  PlayCircle = PlayCircle;
  Infinity = Infinity;
  MessageCircle = MessageCircle;
  ClipboardCheck = ClipboardCheck;
  FileText = FileText;
  CheckCircle = CheckCircle;
  Smartphone = Smartphone;
  ShieldCheck = ShieldCheck;
  Plus = Plus;
  Minus = Minus;

  toggleFaq(index: number): void {
    this.toggleFaqEvent.emit(index);
  }
}
