import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Star,
  ThumbsUp,
  ThumbsDown,
  Trash2,
} from 'lucide-angular';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-reviews.component.html',
  styleUrl: './admin-reviews.component.css',
})
export class AdminReviewsComponent implements OnInit {
  reviews: Review[] = [];
  loading = true;
  StarIcon = Star;
  ThumbsUpIcon = ThumbsUp;
  ThumbsDownIcon = ThumbsDown;
  Trash2Icon = Trash2;

  constructor(private reviewService: ReviewService) {}

  async ngOnInit() {
    await this.loadReviews();
  }

  private async loadReviews() {
    try {
      this.reviews = await import('rxjs').then((m) =>
        m.firstValueFrom(this.reviewService.getAllReviews())
      );
      this.loading = false;
    } catch (error) {
      console.error('Error loading reviews:', error);
      this.loading = false;
    }
  }

  async approveReview(reviewId: string) {
    try {
      await this.reviewService.updateReviewStatus(reviewId, 'approved');
      await this.loadReviews();
    } catch (error) {
      console.error('Error approving review:', error);
    }
  }

  async rejectReview(reviewId: string) {
    try {
      await this.reviewService.updateReviewStatus(reviewId, 'rejected');
      await this.loadReviews();
    } catch (error) {
      console.error('Error rejecting review:', error);
    }
  }

  async deleteReview(reviewId: string) {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await this.reviewService.adminDeleteReview(reviewId);
        await this.loadReviews();
      } catch (error) {
        console.error('Error deleting review:', error);
      }
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
