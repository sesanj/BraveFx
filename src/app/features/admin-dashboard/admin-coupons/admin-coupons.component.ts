import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Play,
  Pause,
} from 'lucide-angular';
import { CouponService } from '../../../core/services/coupon.service';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.css',
})
export class AdminCouponsComponent implements OnInit {
  coupons: any[] = [];
  loading = true;
  showCreateForm = false;
  PlusIcon = Plus;
  Edit2Icon = Edit2;
  Trash2Icon = Trash2;
  TagIcon = Tag;
  PlayIcon = Play;
  PauseIcon = Pause;

  newCoupon = {
    code: '',
    discount_percent: 10,
    is_active: true,
  };

  constructor(private couponService: CouponService) {}

  async ngOnInit() {
    await this.loadCoupons();
  }

  private async loadCoupons() {
    try {
      this.coupons = await this.couponService.getAllCoupons();
      this.loading = false;
    } catch (error) {
      console.error('Error loading coupons:', error);
      this.loading = false;
    }
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  async createCoupon() {
    if (!this.newCoupon.code.trim()) {
      alert('Please enter a coupon code');
      return;
    }

    try {
      await this.couponService.createCoupon(
        this.newCoupon.code.toUpperCase(),
        this.newCoupon.discount_percent,
        this.newCoupon.is_active
      );
      await this.loadCoupons();
      this.toggleCreateForm();
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon');
    }
  }

  async toggleCouponStatus(coupon: any) {
    try {
      await this.couponService.updateCouponStatus(coupon.id, !coupon.active);
      await this.loadCoupons();
    } catch (error) {
      console.error('Error updating coupon:', error);
    }
  }

  async deleteCoupon(couponId: string) {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await this.couponService.deleteCoupon(couponId);
        await this.loadCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      }
    }
  }

  resetForm() {
    this.newCoupon = {
      code: '',
      discount_percent: 10,
      is_active: true,
    };
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
