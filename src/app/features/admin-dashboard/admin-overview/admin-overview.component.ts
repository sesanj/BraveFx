import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  Calendar,
  Mail,
  CheckCircle,
} from 'lucide-angular';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { PaymentService } from '../../../core/services/payment.service';
import { ReviewService } from '../../../core/services/review.service';

interface StatCard {
  title: string;
  value: string;
  subValue: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface RecentEnrollment {
  email: string;
  date: string;
  status: string;
}

interface RecentPayment {
  email: string;
  amount: number;
  date: string;
  status: string;
}

interface RevenueData {
  month: string;
  amount: number;
}

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.css',
})
export class AdminOverviewComponent implements OnInit {
  stats: StatCard[] = [];
  recentEnrollments: RecentEnrollment[] = [];
  recentPayments: RecentPayment[] = [];
  revenueData: RevenueData[] = [];
  loading = true;

  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  StarIcon = Star;
  TrendingUpIcon = TrendingUp;
  CalendarIcon = Calendar;
  MailIcon = Mail;
  CheckCircleIcon = CheckCircle;

  totalRevenue = 0;
  totalStudents = 0;
  avgRating = 0;
  monthlyRevenue = 0;

  constructor(
    private enrollmentService: EnrollmentService,
    private paymentService: PaymentService,
    private reviewService: ReviewService
  ) {}

  async ngOnInit() {
    await this.loadDashboardData();
  }

  private async loadDashboardData() {
    try {
      const { firstValueFrom } = await import('rxjs');
      const [enrollments, payments, reviews] = await Promise.all([
        this.enrollmentService.getAllEnrollments(),
        this.paymentService.getAllPayments(),
        firstValueFrom(this.reviewService.getAllReviews()),
      ]);

      // Calculate totals
      this.totalRevenue = payments.reduce(
        (sum: number, p: any) => sum + p.amount / 100,
        0
      );
      this.totalStudents = enrollments.length;
      this.avgRating =
        reviews.length > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
            reviews.length
          : 0;

      // Calculate monthly revenue (last 6 months)
      this.calculateMonthlyRevenue(payments);

      // Get this month's revenue
      const thisMonth = new Date().getMonth();
      const thisYear = new Date().getFullYear();
      this.monthlyRevenue = payments
        .filter((p: any) => {
          const date = new Date(p.created_at);
          return (
            date.getMonth() === thisMonth && date.getFullYear() === thisYear
          );
        })
        .reduce((sum: number, p: any) => sum + p.amount / 100, 0);

      this.stats = [
        {
          title: 'Total Revenue',
          value: `$${this.totalRevenue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          subValue: `$${this.monthlyRevenue.toFixed(2)} this month`,
          icon: DollarSign,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
        },
        {
          title: 'Total Students',
          value: this.totalStudents.toString(),
          subValue: `${
            enrollments.filter((e: any) => e.status === 'active').length
          } active`,
          icon: Users,
          color: '#3b82f6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
        },
        {
          title: 'Average Rating',
          value: this.avgRating.toFixed(1),
          subValue: `${reviews.length} reviews`,
          icon: Star,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)',
        },
        {
          title: 'Total Payments',
          value: payments.length.toString(),
          subValue: `${
            payments.filter((p: any) => p.status === 'succeeded').length
          } successful`,
          icon: CheckCircle,
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)',
        },
      ];

      // Get recent enrollments (last 5)
      this.recentEnrollments = enrollments
        .sort(
          (a: any, b: any) =>
            new Date(b.enrolled_at).getTime() -
            new Date(a.enrolled_at).getTime()
        )
        .slice(0, 5)
        .map((e: any) => ({
          email: e.profiles?.email || 'Unknown',
          date: e.enrolled_at,
          status: e.status,
        }));

      // Get recent payments (last 5)
      this.recentPayments = payments
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5)
        .map((p: any) => ({
          email: p.user_id,
          amount: p.amount / 100,
          date: p.created_at,
          status: p.status,
        }));

      this.loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.loading = false;
    }
  }

  private calculateMonthlyRevenue(payments: any[]) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const now = new Date();
    const data: { [key: string]: number } = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      data[key] = 0;
    }

    // Calculate revenue per month
    payments.forEach((p: any) => {
      const date = new Date(p.created_at);
      const key = `${months[date.getMonth()]} ${date.getFullYear()}`;
      if (data.hasOwnProperty(key)) {
        data[key] += p.amount / 100;
      }
    });

    this.revenueData = Object.entries(data).map(([month, amount]) => ({
      month,
      amount,
    }));
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getMaxRevenue(): number {
    return Math.max(...this.revenueData.map((d) => d.amount), 1);
  }
}
