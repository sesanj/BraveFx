import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  times_used: number;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discountAmount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Validate a coupon code and calculate discount
   */
  async validateCoupon(
    code: string,
    originalPrice: number
  ): Promise<CouponValidationResult> {
    try {
      // Fetch coupon from database
      const { data: coupon, error } = await this.supabase.client
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .single();

      if (error || !coupon) {
        return {
          valid: false,
          error: 'Coupon code not found',
        };
      }

      // Check if coupon is active
      if (!coupon.active) {
        return {
          valid: false,
          error: 'This coupon is no longer active',
        };
      }

      // Check if coupon is expired
      if (coupon.expires_at) {
        const expiryDate = new Date(coupon.expires_at);
        const now = new Date();
        if (expiryDate < now) {
          return {
            valid: false,
            error: 'This coupon has expired',
          };
        }
      }

      // Check if max uses reached
      if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
        return {
          valid: false,
          error: 'This coupon has reached its usage limit',
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discount_type === 'percentage') {
        discountAmount = (originalPrice * coupon.discount_value) / 100;
      } else {
        discountAmount = coupon.discount_value;
      }

      // Ensure discount doesn't exceed original price
      discountAmount = Math.min(discountAmount, originalPrice);

      return {
        valid: true,
        coupon,
        discountAmount: Number(discountAmount.toFixed(2)),
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Failed to validate coupon',
      };
    }
  }

  /**
   * Record coupon redemption after successful payment
   */
  async recordRedemption(
    couponId: string,
    userId: string,
    enrollmentId: string,
    amountSaved: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Record redemption
      const { error: redemptionError } = await this.supabase.client
        .from('coupon_redemptions')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          enrollment_id: enrollmentId,
          amount_saved: amountSaved,
        });

      if (redemptionError) {
        return { success: false, error: redemptionError.message };
      }

      // Increment times_used
      const { error: updateError } = await this.supabase.client.rpc(
        'increment_coupon_usage',
        { coupon_id: couponId }
      );

      if (updateError) {
        // Don't fail the redemption if this fails, just log it
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user has already used a specific coupon
   */
  async hasUserUsedCoupon(userId: string, couponId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client
        .from('coupon_redemptions')
        .select('id')
        .eq('user_id', userId)
        .eq('coupon_id', couponId)
        .limit(1);

      if (error) {
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the current site-wide default coupon (if any)
   * This is used for campaigns like Black Friday, Launch Week, etc.
   * Default coupons override any specific coupon codes from URLs
   */
  async getDefaultCoupon(): Promise<Coupon | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('coupons')
        .select('*')
        .eq('is_default', true)
        .eq('active', true)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      // Verify it's not expired
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at);
        const now = new Date();
        if (expiryDate < now) {
          return null;
        }
      }

      // Verify max uses not reached
      if (data.max_uses !== null && data.times_used >= data.max_uses) {
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Admin: Get all coupons
   */
  async getAllCoupons(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all coupons:', error);
      return [];
    }
  }

  /**
   * Admin: Create a new coupon
   */
  async createCoupon(
    code: string,
    discountPercent: number,
    isActive: boolean
  ): Promise<void> {
    try {
      const { error } = await this.supabase.client.from('coupons').insert({
        code: code.toUpperCase(),
        discount_type: 'percentage',
        discount_value: discountPercent,
        active: isActive,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating coupon:', error);
      throw error;
    }
  }

  /**
   * Admin: Update coupon status
   */
  async updateCouponStatus(couponId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('coupons')
        .update({ active: isActive })
        .eq('id', couponId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating coupon status:', error);
      throw error;
    }
  }

  /**
   * Admin: Delete a coupon
   */
  async deleteCoupon(couponId: string): Promise<void> {
    try {
      const { error } = await this.supabase.client
        .from('coupons')
        .delete()
        .eq('id', couponId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  }
}
