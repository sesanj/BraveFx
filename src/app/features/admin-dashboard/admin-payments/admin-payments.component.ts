import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Calendar,
  User,
  BarChart3,
  TrendingDown,
  Activity,
} from 'lucide-angular';
import { PaymentService } from '../../../core/services/payment.service';

interface RevenueData {
  month: string;
  amount: number;
  count: number;
}

interface RevenueStat {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface PaymentWithProfile {
  id: string;
  amount: number;
  stripe_payment_intent_id: string;
  created_at: string;
  user_id: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

type TimeRange = '7d' | '1m' | '12m' | 'all' | 'custom';
type ChartType = 'bar' | 'line';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.css',
})
export class AdminPaymentsComponent implements OnInit {
  payments: PaymentWithProfile[] = [];
  filteredPayments: PaymentWithProfile[] = [];
  revenueData: RevenueData[] = [];
  stats: RevenueStat[] = [];
  loading = true;

  // Filters
  selectedTimeRange: TimeRange = 'all';
  chartType: ChartType = 'bar';

  // Icons
  TrendingUpIcon = TrendingUp;
  DollarSignIcon = DollarSign;
  UsersIcon = Users;
  CreditCardIcon = CreditCard;
  CalendarIcon = Calendar;
  UserIcon = User;
  BarChart3Icon = BarChart3;
  TrendingDownIcon = TrendingDown;
  ActivityIcon = Activity;

  totalRevenue = 0;
  maxRevenue = 0;

  constructor(private paymentService: PaymentService) {}

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData() {
    try {
      // Load payments with profiles
      this.payments = await this.paymentService.getAllPayments();
      console.log('Loaded payments:', this.payments);
      this.filterByTimeRange();
      console.log('Filtered payments:', this.filteredPayments);

      this.loading = false;
    } catch (error) {
      console.error('Error loading revenue data:', error);
      this.loading = false;
    }
  }

  changeTimeRange(range: TimeRange) {
    this.selectedTimeRange = range;
    this.filterByTimeRange();
  }

  toggleChartType() {
    this.chartType = this.chartType === 'bar' ? 'line' : 'bar';
  }

  private filterByTimeRange() {
    const now = new Date();
    let startDate: Date;

    switch (this.selectedTimeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate()
        );
        break;
      case '12m':
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate()
        );
        break;
      case 'all':
      default:
        startDate = new Date(0);
        break;
    }

    this.filteredPayments = this.payments.filter(
      (p) => new Date(p.created_at) >= startDate
    );

    this.calculateRevenueData();
    this.calculateStats();
  }

  private calculateRevenueData() {
    const periodData = new Map<string, { amount: number; count: number }>();
    const now = new Date();

    // Determine periods based on time range
    let periods: string[] = [];
    if (this.selectedTimeRange === '7d') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        periods.push(key);
        periodData.set(key, { amount: 0, count: 0 });
      }
    } else if (this.selectedTimeRange === '1m') {
      // Show 4 weeks for 1 month view
      const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      weekLabels.forEach((label) => {
        periods.push(label);
        periodData.set(label, { amount: 0, count: 0 });
      });
    } else {
      // 12m or all - show months
      const monthsToShow = this.selectedTimeRange === '12m' ? 12 : 12;
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
        periods.push(key);
        periodData.set(key, { amount: 0, count: 0 });
      }
    }

    // Aggregate filtered payment data
    this.filteredPayments.forEach((payment) => {
      const date = new Date(payment.created_at);
      let key: string;

      if (this.selectedTimeRange === '7d') {
        key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      } else if (this.selectedTimeRange === '1m') {
        // Calculate which week (0-29 days -> 4 weeks)
        const daysDiff = Math.floor(
          (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)
        );
        if (daysDiff <= 29) {
          const weekIndex = Math.floor((29 - daysDiff) / 7.5);
          key = `Week ${Math.min(weekIndex + 1, 4)}`;
        } else {
          return; // Skip if outside range
        }
      } else {
        key = date.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        });
      }

      if (periodData.has(key)) {
        const existing = periodData.get(key)!;
        existing.amount += payment.amount;
        existing.count += 1;
      }
    });

    // Convert to array
    this.revenueData = periods.map((period) => ({
      month: period,
      amount: periodData.get(period)!.amount / 100,
      count: periodData.get(period)!.count,
    }));

    this.totalRevenue =
      this.filteredPayments.reduce((sum, p) => sum + p.amount, 0) / 100;
    this.maxRevenue = Math.max(...this.revenueData.map((d) => d.amount), 1);
  }

  private calculateStats() {
    const avgTransactionValue =
      this.filteredPayments.length > 0
        ? this.totalRevenue / this.filteredPayments.length
        : 0;

    const uniqueUsers = new Set(this.filteredPayments.map((p) => p.user_id))
      .size;

    // Calculate growth
    const midPoint = Math.floor(this.filteredPayments.length / 2);
    const firstHalf = this.filteredPayments.slice(0, midPoint);
    const secondHalf = this.filteredPayments.slice(midPoint);

    const firstHalfRevenue =
      firstHalf.reduce((sum, p) => sum + p.amount, 0) / 100;
    const secondHalfRevenue =
      secondHalf.reduce((sum, p) => sum + p.amount, 0) / 100;

    const growth =
      firstHalfRevenue > 0
        ? (
            ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) *
            100
          ).toFixed(1)
        : '0';

    const timeRangeLabel = this.getTimeRangeLabel();

    this.stats = [
      {
        title: 'Total Revenue',
        value: `$${this.totalRevenue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: timeRangeLabel,
        icon: DollarSign,
        color: 'linear-gradient(135deg, #10b981, #34d399)',
      },
      {
        title: 'Transactions',
        value: this.filteredPayments.length.toString(),
        change: `${growth}% growth`,
        icon: TrendingUp,
        color: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      },
      {
        title: 'Unique Customers',
        value: uniqueUsers.toString(),
        change: `${this.filteredPayments.length} purchases`,
        icon: Users,
        color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      },
      {
        title: 'Avg Transaction',
        value: `$${avgTransactionValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        change: 'Per purchase',
        icon: CreditCard,
        color: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      },
    ];
  }

  getTimeRangeLabel(): string {
    switch (this.selectedTimeRange) {
      case '7d':
        return 'Last 7 days';
      case '1m':
        return 'Last 30 days';
      case '12m':
        return 'Last 12 months';
      case 'all':
        return 'All time';
      default:
        return '';
    }
  }

  getBarHeight(amount: number): number {
    return this.maxRevenue > 0 ? (amount / this.maxRevenue) * 100 : 0;
  }

  formatAmount(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getInitials(name: string): string {
    if (!name) return 'NA';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getStudentName(payment: PaymentWithProfile): string {
    return payment.profiles?.full_name || payment.profiles?.email || 'Unknown';
  }

  getStudentEmail(payment: PaymentWithProfile): string {
    return payment.profiles?.email || 'N/A';
  }

  // Line chart methods
  getXPosition(index: number): number {
    const spacing = 1000 / Math.max(this.revenueData.length - 1, 1);
    return index * spacing;
  }

  getYPosition(amount: number): number {
    const maxHeight = 280;
    const percentage = this.maxRevenue > 0 ? amount / this.maxRevenue : 0;
    return maxHeight - percentage * maxHeight;
  }

  getLineChartPoints(): string {
    return this.revenueData
      .map(
        (data, i) => `${this.getXPosition(i)},${this.getYPosition(data.amount)}`
      )
      .join(' ');
  }

  getAreaFillPoints(): string {
    const linePoints = this.getLineChartPoints();
    const lastX = this.getXPosition(this.revenueData.length - 1);
    return `0,280 ${linePoints} ${lastX},280`;
  }

  // Donut chart methods
  getCircumference(): number {
    return 2 * Math.PI * 90; // radius is 90
  }

  getFirstHalfRevenue(): number {
    const midPoint = Math.ceil(this.revenueData.length / 2);
    return this.revenueData
      .slice(0, midPoint)
      .reduce((sum, d) => sum + d.amount, 0);
  }

  getSecondHalfRevenue(): number {
    const midPoint = Math.ceil(this.revenueData.length / 2);
    return this.revenueData
      .slice(midPoint)
      .reduce((sum, d) => sum + d.amount, 0);
  }

  getFirstHalfCircumference(): number {
    const firstHalf = this.getFirstHalfRevenue();
    const percentage =
      this.totalRevenue > 0 ? firstHalf / this.totalRevenue : 0.5;
    return this.getCircumference() * percentage;
  }

  getSecondHalfCircumference(): number {
    const secondHalf = this.getSecondHalfRevenue();
    const percentage =
      this.totalRevenue > 0 ? secondHalf / this.totalRevenue : 0.5;
    return this.getCircumference() * percentage;
  }
}
