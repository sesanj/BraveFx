import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  CheckCircle,
} from 'lucide-angular';
import { AuthService } from '../../../../core/services/auth.service';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface SupportForm {
  name: string;
  email: string;
  subjectCategory: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css'],
})
export class SupportComponent implements OnInit {
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
  CheckCircle = CheckCircle;

  // FAQ data
  activeFaq: number | null = null;

  // Subject categories for dropdown
  subjectCategories = [
    { value: '', label: 'Select a category...' },
    { value: 'Course Content Question', label: 'Course Content Question' },
    { value: 'Billing & Payments', label: 'Billing & Payments' },
    { value: 'Request A Refund', label: 'Request A Refund' },
    { value: 'Account & Login Issues', label: 'Account & Login Issues' },
    { value: 'Technical Problem', label: 'Technical Problem' },
    { value: 'Feature Request', label: 'Feature Request' },
    { value: 'General Question', label: 'General Question' },
    { value: 'Other', label: 'Other' },
  ];

  // Form model
  formData: SupportForm = {
    name: '',
    email: '',
    subjectCategory: '',
    subject: '',
    message: '',
  };

  // Form state
  isSubmitting = false;
  showSuccess = false;
  errorMessage = '';
  showOtherSubject = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    // Auto-populate name and email from logged-in user
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.formData.email = user.email || '';
        // Try to get name from user metadata or profile
        this.loadUserProfile(user.id);
      }
    });
  }

  async loadUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      if (data && !error) {
        this.formData.name = data.full_name || '';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  onCategoryChange() {
    this.showOtherSubject = this.formData.subjectCategory === 'Other';
    // Clear custom subject when switching away from "Other"
    if (!this.showOtherSubject) {
      this.formData.subject = '';
    }
  }

  async onSubmit() {
    // Reset states
    this.errorMessage = '';
    this.showSuccess = false;

    // Validation
    if (!this.formData.name.trim()) {
      this.errorMessage = 'Please enter your name';
      return;
    }

    if (
      !this.formData.email.trim() ||
      !this.isValidEmail(this.formData.email)
    ) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!this.formData.subjectCategory) {
      this.errorMessage = 'Please select a category';
      return;
    }

    if (this.showOtherSubject && !this.formData.subject.trim()) {
      this.errorMessage = 'Please enter a subject';
      return;
    }

    if (!this.formData.message.trim()) {
      this.errorMessage = 'Please enter your message';
      return;
    }

    // Prepare subject
    const finalSubject = this.showOtherSubject
      ? this.formData.subject
      : this.formData.subjectCategory;

    try {
      this.isSubmitting = true;

      // Call Supabase Edge Function
      const { data, error } =
        await this.supabaseService.client.functions.invoke(
          'send-support-email',
          {
            body: {
              name: this.formData.name,
              email: this.formData.email,
              subjectCategory: this.formData.subjectCategory,
              subject: finalSubject,
              message: this.formData.message,
            },
          }
        );

      if (error) throw error;

      // Success!
      this.showSuccess = true;
      this.resetForm();

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccess = false;
      }, 5000);
    } catch (error: any) {
      console.error('Error sending support email:', error);
      this.errorMessage =
        'Failed to send message. Please try again or email us directly at support@bravefx.com';
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    // Keep name and email, reset rest
    this.formData.subjectCategory = '';
    this.formData.subject = '';
    this.formData.message = '';
    this.showOtherSubject = false;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

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
