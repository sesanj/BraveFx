import { Component } from '@angular/core';
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
  // Component owns its FAQs data and state
  faqs: FAQ[] = [
    {
      question: 'Is this course suitable for complete beginners?',
      answer:
        'Absolutely! This course is designed to take you from zero knowledge to confident trader. We start with the basics and progressively build your skills. No prior trading experience required.',
      isOpen: false,
    },
    {
      question: 'How long do I have access to the course?',
      answer:
        "You get lifetime access to all course materials. Plus, you'll receive all future updates and new content at no additional cost. Learn at your own pace, whenever suits you best.",
      isOpen: false,
    },
    {
      question: 'What if I am not satisfied with the course?',
      answer:
        'We offer a 30-day money-back guarantee. If you are not completely satisfied, just email us and we will refund your purchase—no questions asked.',
      isOpen: false,
    },
    {
      question: 'Do I need expensive software or tools?',
      answer:
        "No! We'll show you how to use free charting platforms and explain what you actually need. You don't need to spend thousands on software to be successful.",
      isOpen: false,
    },
    {
      question: 'How much time do I need to commit?',
      answer:
        'You can go at your own pace. Some students finish in a few weeks, others prefer to spread it over months. Each lesson is bite-sized (10-20 minutes), so you can fit learning around your schedule.',
      isOpen: false,
    },
  ];

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
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }
}
