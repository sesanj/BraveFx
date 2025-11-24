import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  BookOpen,
  Mail,
  MessageCircle,
  ChevronDown,
  Send,
  FileText,
  Video,
  Users,
  Download,
} from 'lucide-angular';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent {
  // Icons
  BookOpen = BookOpen;
  Mail = Mail;
  MessageCircle = MessageCircle;
  ChevronDown = ChevronDown;
  Send = Send;
  FileText = FileText;
  Video = Video;
  Users = Users;
  Download = Download;

  // FAQ data
  activeFaq: number | null = null;

  faqs = [
    {
      question: 'How do I access my enrolled courses?',
      answer:
        'You can access all your enrolled courses from the "My Courses" tab in the dashboard. Click on any course card to continue learning from where you left off.',
    },
    {
      question: 'Can I download course materials?',
      answer:
        'Yes! Most courses include downloadable resources like PDFs, cheat sheets, and supplementary materials. Look for the download icon in the Resources panel while viewing course content.',
    },
    {
      question: 'How do I track my learning progress?',
      answer:
        'Your progress is automatically tracked as you complete lessons and quizzes. Visit the "Progress" tab to see detailed analytics, completion rates, and your learning history.',
    },
    {
      question: 'What happens if I fail a quiz?',
      answer:
        "Don't worry! You can retake quizzes as many times as needed. We recommend reviewing the lesson material before attempting again. Your highest score will be recorded.",
    },
    {
      question: 'How do I earn certificates?',
      answer:
        'Certificates are automatically awarded when you complete all lessons and pass all quizzes in a course with a minimum score of 70%. You can download your certificates from the course completion page.',
    },
    {
      question: 'Can I access courses on mobile devices?',
      answer:
        'Absolutely! Our platform is fully responsive and works seamlessly on smartphones and tablets. You can learn anywhere, anytime.',
    },
    {
      question: 'How long do I have access to a course?',
      answer:
        'Once you enroll in a course, you have lifetime access! Learn at your own pace without any time pressure.',
    },
    {
      question: 'Is there a refund policy?',
      answer:
        "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with a course within 30 days of purchase, contact our support team for a full refund.",
    },
  ];

  toggleFaq(index: number): void {
    this.activeFaq = this.activeFaq === index ? null : index;
  }
}
