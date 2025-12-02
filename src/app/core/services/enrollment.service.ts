import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string; // Changed from number to string (UUID)
  enrolled_at: string;
  status:
    | 'active'
    | 'trial'
    | 'expired'
    | 'refunded'
    | 'suspended'
    | 'completed';
  expires_at?: string;
  payment_id?: string;
  purchased_by?: string;
  completed_at?: string;
  progress: number;
  certificate_issued: boolean;
  last_accessed_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Check if user is enrolled in a specific course
   */
  async isEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.client
        .from('enrollments')
        .select('id, status, expires_at')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error || !data) return false;

      // Check if enrollment is valid (not expired, not refunded, etc.)
      if (!['active', 'trial', 'completed'].includes(data.status)) {
        return false;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Get all enrollments for a user
   */
  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['active', 'trial', 'completed'])
        .order('enrolled_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  }

  /**
   * Get enrollment details for a specific course
   */
  async getEnrollment(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    try {
      const { data, error } = await this.supabase.client
        .from('enrollments')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return null;
    }
  }

  /**
   * Update enrollment progress
   */
  async updateProgress(
    userId: string,
    courseId: string,
    progress: number
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('enrollments')
        .update({
          progress: Math.min(Math.max(progress, 0), 100), // Clamp between 0-100
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }

  /**
   * Mark course as completed
   */
  async markCourseCompleted(
    userId: string,
    courseId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.client
        .from('enrollments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress: 100,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking course completed:', error);
      return false;
    }
  }

  /**
   * Update last accessed time (call this when user opens a course)
   */
  async updateLastAccessed(userId: string, courseId: string): Promise<void> {
    try {
      await this.supabase.client
        .from('enrollments')
        .update({
          last_accessed_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('course_id', courseId);
    } catch (error) {
      console.error('Error updating last accessed:', error);
    }
  }

  /**
   * Get all course IDs the user is enrolled in
   */
  async getUserCourseIds(userId: string): Promise<string[]> {
    try {
      console.log(
        '🔍 [EnrollmentService] Getting course IDs for user:',
        userId
      );
      const enrollments = await this.getUserEnrollments(userId);
      console.log('🔍 [EnrollmentService] Found enrollments:', enrollments);
      const courseIds = enrollments.map((e) => e.course_id);
      console.log('🔍 [EnrollmentService] Returning course IDs:', courseIds);
      return courseIds;
    } catch (error) {
      console.error('❌ [EnrollmentService] Error fetching course IDs:', error);
      return [];
    }
  }
}
