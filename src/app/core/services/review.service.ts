import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map, catchError, of } from 'rxjs';
import {
  Review,
  ReviewStats,
  CreateReviewRequest,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get all reviews for a course
   */
  getCourseReviews(courseId: string): Observable<Review[]> {
    return from(
      this.supabase.client
        .from('reviews')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return (response.data || []).map((review: any) => ({
          id: review.id,
          courseId: review.course_id,
          userId: review.user_id,
          userName: review.profiles?.full_name || 'Anonymous',
          userAvatar: review.profiles?.avatar_url,
          rating: review.rating,
          reviewText: review.review_text,
          isFeatured: review.is_featured,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
        }));
      }),
      catchError((error) => {
        console.error('Error fetching course reviews:', error);
        return of([]);
      })
    );
  }

  /**
   * Get featured reviews
   */
  getFeaturedReviews(limit: number = 10): Observable<Review[]> {
    return from(
      this.supabase.client
        .from('reviews')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          courses:course_id (
            title
          )
        `
        )
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return (response.data || []).map((review: any) => ({
          id: review.id,
          courseId: review.course_id,
          userId: review.user_id,
          userName: review.profiles?.full_name || 'Anonymous',
          userAvatar: review.profiles?.avatar_url,
          rating: review.rating,
          reviewText: review.review_text,
          isFeatured: review.is_featured,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          courseName: review.courses?.title,
        }));
      }),
      catchError((error) => {
        console.error('Error fetching featured reviews:', error);
        return of([]);
      })
    );
  }

  /**
   * Get all reviews (paginated)
   */
  getAllReviews(page: number = 1, pageSize: number = 12): Observable<Review[]> {
    const rangeFrom = (page - 1) * pageSize;
    const rangeTo = rangeFrom + pageSize - 1;

    return from(
      this.supabase.client
        .from('reviews')
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          ),
          courses:course_id (
            title
          )
        `
        )
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;

        console.log('=== REVIEW SERVICE getAllReviews DEBUG ===');
        console.log('Raw Supabase response:', response.data);

        const mappedReviews = (response.data || []).map((review: any) => {
          console.log('Processing review:', {
            id: review.id,
            review_text_raw: review.review_text,
            review_text_type: typeof review.review_text,
            review_text_length: review.review_text?.length || 0,
          });

          return {
            id: review.id,
            courseId: review.course_id,
            userId: review.user_id,
            userName: review.profiles?.full_name || 'Anonymous',
            userAvatar: review.profiles?.avatar_url,
            rating: review.rating,
            reviewText: review.review_text,
            isFeatured: review.is_featured,
            createdAt: review.created_at,
            updatedAt: review.updated_at,
            courseName: review.courses?.title,
          };
        });

        console.log('Mapped reviews:', mappedReviews);
        console.log('=== END REVIEW SERVICE DEBUG ===');

        return mappedReviews;
      }),
      catchError((error) => {
        console.error('Error fetching all reviews:', error);
        return of([]);
      })
    );
  }

  /**
   * Get review statistics for a course
   */
  getCourseReviewStats(courseId: string): Observable<ReviewStats> {
    return from(
      this.supabase.client
        .from('reviews')
        .select('rating')
        .eq('course_id', courseId)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;

        const reviews = response.data || [];
        const totalReviews = reviews.length;

        if (totalReviews === 0) {
          return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          };
        }

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        let totalRating = 0;

        reviews.forEach((review: any) => {
          const rating = review.rating as 1 | 2 | 3 | 4 | 5;
          ratingDistribution[rating]++;
          totalRating += rating;
        });

        return {
          averageRating: parseFloat((totalRating / totalReviews).toFixed(2)),
          totalReviews,
          ratingDistribution,
        };
      }),
      catchError((error) => {
        console.error('Error fetching review stats:', error);
        return of({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        });
      })
    );
  }

  /**
   * Create a new review
   */
  async createReview(request: CreateReviewRequest): Promise<Review | null> {
    try {
      console.log('=== CREATE REVIEW DEBUG ===');
      console.log('Request:', request);

      // Get current user
      const userResponse = await this.supabase.client.auth.getUser();
      if (userResponse.error || !userResponse.data.user) {
        throw new Error('User not authenticated');
      }

      const userId = userResponse.data.user.id;

      const reviewData = {
        user_id: userId,
        course_id: request.courseId,
        rating: request.rating,
        review_text: request.reviewText,
        is_featured: false,
      };

      console.log('Data being inserted:', reviewData);

      // Insert the review
      const { data, error } = await this.supabase.client
        .from('reviews')
        .insert(reviewData)
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error('Insert error:', error);
        // Check if it's a duplicate review
        if (error.code === '23505') {
          throw new Error('You have already reviewed this course');
        }
        throw error;
      }

      console.log('Insert successful, returned data:', data);
      console.log('=== END CREATE REVIEW DEBUG ===');

      const review = data as any;
      return {
        id: review.id,
        courseId: review.course_id,
        userId: review.user_id,
        userName: review.profiles?.full_name || 'Anonymous',
        userAvatar: review.profiles?.avatar_url,
        rating: review.rating,
        reviewText: review.review_text,
        isFeatured: review.is_featured,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    rating: number,
    reviewText: string
  ): Promise<Review | null> {
    try {
      console.log('=== UPDATE REVIEW DEBUG ===');
      console.log('Review ID:', reviewId);
      console.log('New rating:', rating);
      console.log('New text:', reviewText);

      const { data, error } = await this.supabase.client
        .from('reviews')
        .update({
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select(
          `
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful, returned data:', data);
      console.log('=== END UPDATE REVIEW DEBUG ===');

      const review = data as any;
      return {
        id: review.id,
        courseId: review.course_id,
        userId: review.user_id,
        userName: review.profiles?.full_name || 'Anonymous',
        userAvatar: review.profiles?.avatar_url,
        rating: review.rating,
        reviewText: review.review_text,
        isFeatured: review.is_featured,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      };
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  deleteReview(reviewId: string): Observable<boolean> {
    return from(
      this.supabase.client.from('reviews').delete().eq('id', reviewId)
    ).pipe(
      map((response) => {
        if (response.error) throw response.error;
        return true;
      }),
      catchError((error) => {
        console.error('Error deleting review:', error);
        return of(false);
      })
    );
  }

  /**
   * Check if the current user has reviewed a course
   */
  async hasUserReviewedCourse(courseId: string): Promise<boolean> {
    const { data: userData } = await this.supabase.auth.getUser();
    if (!userData?.user) return false;

    const { data, error } = await this.supabase.client
      .from('reviews')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user review:', error);
      return false;
    }

    return data !== null;
  }

  /**
   * Get the current user's review for a course
   */
  async getUserReviewForCourse(courseId: string): Promise<Review | null> {
    const { data: userData } = await this.supabase.auth.getUser();
    if (!userData?.user) return null;

    const { data, error } = await this.supabase.client
      .from('reviews')
      .select(
        `
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `
      )
      .eq('course_id', courseId)
      .eq('user_id', userData.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user review:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      courseId: data.course_id,
      userId: data.user_id,
      userName: (data as any).profiles?.full_name || 'Anonymous',
      userAvatar: (data as any).profiles?.avatar_url,
      rating: data.rating,
      reviewText: data.review_text,
      isFeatured: data.is_featured,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}
