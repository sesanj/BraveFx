import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReviewService } from '../../core/services/review.service';
import { forkJoin } from 'rxjs';
import {
  LucideAngularModule,
  Star,
  TrendingUp,
  Users,
  Filter,
  Search,
  CheckCircle2,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css'],
})
export class ReviewsComponent implements OnInit {
  // Icons
  Star = Star;
  TrendingUp = TrendingUp;
  Users = Users;
  Filter = Filter;
  Search = Search;
  CheckCircle2 = CheckCircle2;
  MapPin = MapPin;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;

  // Data
  allReviews: any[] = [];
  filteredReviews: any[] = [];
  displayedReviews: any[] = [];

  // Stats
  totalReviews = 0;
  averageRating = 0;
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  // Filters
  selectedRatingFilter = 'all';
  searchQuery = '';
  sortBy = 'recent'; // recent, highest, lowest

  // Pagination
  currentPage = 1;
  reviewsPerPage = 12;
  totalPages = 0;

  // Loading state
  isLoading = true;

  // Expose Math for template
  Math = Math;

  constructor(private http: HttpClient, private reviewService: ReviewService) {}

  ngOnInit(): void {
    this.loadReviews();
  }

  private loadReviews(): void {
    this.isLoading = true;

    // Load reviews from both JSON file AND Supabase database
    forkJoin({
      jsonReviews: this.http.get<any>('/assets/data/reviews.json'),
      dbReviews: this.reviewService.getAllReviews(1, 2000),
    }).subscribe({
      next: ({ jsonReviews, dbReviews }) => {
        // Map JSON reviews (from Udemy)
        const reviewsFromJson = jsonReviews.allReviews.map((review: any) => ({
          id: `json-${review.id}`,
          name: review.name,
          rating: review.rating,
          text: review.comment,
          date: new Date(review.date),
          location: `${review.location}, ${review.region}`,
          verified: true,
          source: 'udemy',
        }));

        // Map database reviews (from Supabase)
        const reviewsFromDb = dbReviews.map((review) => ({
          id: `db-${review.id}`,
          name: review.userName,
          rating: review.rating,
          text: review.reviewText,
          date: new Date(review.createdAt),
          location: null,
          verified: true,
          source: 'platform',
        }));

        // Combine both sources
        this.allReviews = [...reviewsFromJson, ...reviewsFromDb];

        // Update stats from JSON (these are accurate for Udemy reviews)
        this.totalReviews = this.allReviews.length;
        this.calculateStats();

        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.isLoading = false;
        this.loadFallbackData();
      },
    });
  }

  private loadFallbackData(): void {
    // Fallback sample data
    this.allReviews = [
      {
        id: '1',
        name: 'Sarah Johnson',
        rating: 5,
        text: 'This course completely transformed my trading! The strategies are practical and the support is amazing.',
        date: new Date('2024-11-20'),
        location: 'New York, USA',
        verified: true,
      },
      {
        id: '2',
        name: 'Michael Chen',
        rating: 5,
        text: "Best investment I've made in my trading education. The community alone is worth it!",
        date: new Date('2024-11-18'),
        location: 'Singapore',
        verified: true,
      },
      {
        id: '3',
        name: 'Emma Williams',
        rating: 4,
        text: 'Great content and very well structured. Would love more advanced modules in the future.',
        date: new Date('2024-11-15'),
        location: 'London, UK',
        verified: true,
      },
    ];

    this.calculateStats();
    this.applyFilters();
  }

  private calculateStats(): void {
    this.totalReviews = this.allReviews.length;

    if (this.totalReviews === 0) {
      this.averageRating = 0;
      return;
    }

    // Calculate average rating
    const totalRating = this.allReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.averageRating = parseFloat(
      (totalRating / this.totalReviews).toFixed(1)
    );

    // Calculate rating distribution
    this.ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.allReviews.forEach((review) => {
      this.ratingDistribution[
        review.rating as keyof typeof this.ratingDistribution
      ]++;
    });
  }

  resetFilters(): void {
    this.selectedRatingFilter = 'all';
    this.searchQuery = '';
    this.sortBy = 'recent';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.allReviews];

    // Rating filter
    if (this.selectedRatingFilter !== 'all') {
      const rating = parseInt(this.selectedRatingFilter);
      filtered = filtered.filter((review) => review.rating === rating);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.name.toLowerCase().includes(query) ||
          review.text.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered = this.sortReviews(filtered);

    this.filteredReviews = filtered;
    this.totalPages = Math.ceil(
      this.filteredReviews.length / this.reviewsPerPage
    );
    this.currentPage = 1; // Reset to first page when filters change
    this.updateDisplayedReviews();
  }

  private sortReviews(reviews: any[]): any[] {
    switch (this.sortBy) {
      case 'recent':
        return reviews.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'highest':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return reviews.sort((a, b) => a.rating - b.rating);
      default:
        return reviews;
    }
  }

  private updateDisplayedReviews(): void {
    const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
    const endIndex = startIndex + this.reviewsPerPage;
    this.displayedReviews = this.filteredReviews.slice(startIndex, endIndex);
  }

  onRatingFilterChange(rating: string): void {
    this.selectedRatingFilter = rating;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(sort: string): void {
    this.sortBy = sort;
    this.applyFilters();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedReviews();
      this.scrollToTop();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedReviews();
      this.scrollToTop();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedReviews();
      this.scrollToTop();
    }
  }

  getStarArray(rating: number): number[] {
    // Return an array with length equal to the rating
    // e.g., rating 3 returns [1, 2, 3]
    return Array(Math.floor(rating))
      .fill(0)
      .map((_, i) => i + 1);
  }

  getRatingPercentage(rating: number): number {
    if (this.totalReviews === 0) return 0;
    return (
      (this.ratingDistribution[rating as keyof typeof this.ratingDistribution] /
        this.totalReviews) *
      100
    );
  }

  getRatingCount(rating: number): number {
    return this.ratingDistribution[
      rating as keyof typeof this.ratingDistribution
    ];
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  private scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(-1); // Ellipsis
        pages.push(this.totalPages);
      }
    }

    return pages;
  }
}
