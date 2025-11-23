import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReviewService } from '../../../../core/services/review.service';
import {
  LucideAngularModule,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Globe,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
} from 'lucide-angular';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  reviewsData: any = null;
  featuredReviews: any[] = [];
  allReviews: any[] = [];
  filteredReviews: any[] = [];
  currentCarouselIndex = 0;
  isReviewsModalOpen = false;
  isSingleReviewModalOpen = false;
  selectedReview: any = null;
  selectedRatingFilter = 'all';
  selectedRegionFilter = 'all';
  selectedSortFilter = 'recent';
  currentReviewsPage = 1;
  reviewsPerPage = 12;
  reviewsPerSlide = 3;
  private screenWidth: number = 0;

  // Icons
  MessageCircle = MessageCircle;
  CheckCircle2 = CheckCircle2;
  ArrowRight = ArrowRight;
  MapPin = MapPin;
  Globe = Globe;
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  X = X;
  Filter = Filter;

  constructor(private reviewService: ReviewService, private http: HttpClient) {}

  ngOnInit(): void {
    this.loadReviewsData();
    this.updateReviewsPerSlide();

    // Listen for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.updateReviewsPerSlide());
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', () => this.updateReviewsPerSlide());
    }
  }

  private updateReviewsPerSlide(): void {
    if (typeof window !== 'undefined') {
      this.screenWidth = window.innerWidth;

      if (this.screenWidth < 768) {
        // Mobile: 1 review per slide
        this.reviewsPerSlide = 1;
      } else if (this.screenWidth < 1025) {
        // Tablet: 2 reviews per slide
        this.reviewsPerSlide = 2;
      } else {
        // Desktop: 3 reviews per slide
        this.reviewsPerSlide = 3;
      }

      // Reset carousel to first slide when screen size changes
      if (this.currentCarouselIndex >= this.totalCarouselSlides) {
        this.currentCarouselIndex = 0;
      }
    }
  }

  /**
   * Transform a database review to UI format
   */
  private transformReviewToUI(review: any): any {
    return {
      id: review.id,
      name: review.userName,
      avatar: review.userAvatar || '/assets/avatars/default.jpg',
      rating: review.rating,
      comment: review.reviewText,
      date: new Date(review.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      location: 'Global',
      region: 'Global',
      courseName: review.courseName || 'BraveFx Course',
      verified: true,
    };
  }

  // Load reviews from JSON file first, then add database reviews
  loadReviewsData() {
    // First, load existing reviews from JSON file
    this.http.get<any>('/assets/data/reviews.json').subscribe({
      next: (data) => {
        this.reviewsData = data;
        const jsonFeaturedReviews = data.featuredReviews || [];
        const jsonAllReviews = data.allReviews || [];

        // Set the data immediately from JSON
        this.featuredReviews = jsonFeaturedReviews;
        this.allReviews = jsonAllReviews;
        this.filteredReviews = [...jsonAllReviews];

        // Now fetch reviews from database and merge them
        this.reviewService.getAllReviews(1, 100).subscribe({
          next: (dbReviews) => {
            console.log('=== DATABASE REVIEWS DEBUG ===');
            console.log('Total DB reviews fetched:', dbReviews.length);
            console.log('Raw database reviews:', dbReviews);

            // Log each review text field specifically
            dbReviews.forEach((review, index) => {
              console.log(`Review ${index + 1}:`, {
                id: review.id,
                userName: review.userName,
                rating: review.rating,
                reviewText: review.reviewText,
                reviewTextLength: review.reviewText?.length || 0,
                reviewTextType: typeof review.reviewText,
              });
            });

            // Transform database reviews to match UI format
            const transformedDbReviews = dbReviews.map(
              this.transformReviewToUI.bind(this)
            );

            console.log('Transformed DB reviews:', transformedDbReviews);
            console.log('=== END DEBUG ===');

            // Merge: Database reviews first (newest), then JSON reviews
            this.allReviews = [...transformedDbReviews, ...jsonAllReviews];
            this.filteredReviews = [...this.allReviews];

            // For featured reviews, prefer database featured reviews, then fill with JSON
            this.reviewService.getFeaturedReviews(10).subscribe({
              next: (featuredDbReviews) => {
                const transformedFeaturedDb = featuredDbReviews.map(
                  this.transformReviewToUI.bind(this)
                );

                // Merge featured: Database featured first, then JSON featured
                this.featuredReviews = [
                  ...transformedFeaturedDb,
                  ...jsonFeaturedReviews,
                ];
              },
              error: (error) => {
                console.error(
                  'Error loading featured reviews from database:',
                  error
                );
                // Use only JSON featured reviews if database fails
                this.featuredReviews = jsonFeaturedReviews;
              },
            });
          },
          error: (error) => {
            console.error('Error loading reviews from database:', error);
            // Fall back to only JSON reviews if database fails
            this.allReviews = jsonAllReviews;
            this.filteredReviews = [...this.allReviews];
            this.featuredReviews = jsonFeaturedReviews;
          },
        });
      },
      error: (error) => {
        console.error('Error loading reviews from JSON:', error);
        // If JSON fails, try to load only from database
        this.loadOnlyFromDatabase();
      },
    });
  }

  // Fallback method to load only from database if JSON fails
  private loadOnlyFromDatabase() {
    this.reviewService.getAllReviews(1, 100).subscribe({
      next: (reviews) => {
        this.allReviews = reviews.map(this.transformReviewToUI.bind(this));
        this.filteredReviews = [...this.allReviews];

        // Get featured reviews
        this.reviewService.getFeaturedReviews(10).subscribe({
          next: (featured) => {
            this.featuredReviews = featured.map(
              this.transformReviewToUI.bind(this)
            );
          },
        });
      },
      error: (error) => {
        console.error('Error loading reviews from database:', error);
      },
    });
  }

  get totalCarouselSlides(): number {
    return Math.ceil(this.featuredReviews.length / this.reviewsPerSlide);
  }

  getCarouselSlide(slideIndex: number): any[] {
    const start = slideIndex * this.reviewsPerSlide;
    const end = start + this.reviewsPerSlide;
    return this.featuredReviews.slice(start, end);
  }

  get carouselTrackColumns(): string {
    return `repeat(${this.totalCarouselSlides}, 100%)`;
  }

  get slideGridColumns(): string {
    return `repeat(${this.reviewsPerSlide}, 1fr)`;
  }

  get canGoPrevious(): boolean {
    return this.currentCarouselIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentCarouselIndex < this.totalCarouselSlides - 1;
  }

  get uniqueRegions(): string[] {
    const regions = new Set(this.allReviews.map((r: any) => r.region));
    return Array.from(regions).filter(Boolean) as string[];
  }

  get paginatedReviews(): any[] {
    const start = (this.currentReviewsPage - 1) * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    return this.filteredReviews.slice(start, end);
  }

  get totalReviewPages(): number {
    return Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
  }

  getTopRegions(): any[] {
    if (!this.reviewsData?.regionalBreakdown) return [];

    // Convert object to array and sort by percentage
    return Object.entries(this.reviewsData.regionalBreakdown)
      .map(([name, data]: [string, any]) => ({
        name,
        percentage: data.percentage,
        count: data.count,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  }

  getStarArray(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  openReviewsModal(): void {
    this.isReviewsModalOpen = true;
    this.applyReviewFilters();
  }

  closeReviewsModal(): void {
    this.isReviewsModalOpen = false;
  }

  openSingleReviewModal(review: any): void {
    this.selectedReview = review;
    this.isSingleReviewModalOpen = true;
  }

  closeSingleReviewModal(): void {
    this.isSingleReviewModalOpen = false;
    this.selectedReview = null;
  }

  previousSlide(): void {
    if (this.canGoPrevious) {
      this.currentCarouselIndex--;
    }
  }

  nextSlide(): void {
    if (this.canGoNext) {
      this.currentCarouselIndex++;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.totalCarouselSlides) {
      this.currentCarouselIndex = index;
    }
  }

  applyReviewFilters(): void {
    let filtered = [...this.allReviews];

    // Filter by rating
    if (this.selectedRatingFilter !== 'all') {
      const rating = parseInt(this.selectedRatingFilter);
      filtered = filtered.filter((r) => r.rating === rating);
    }

    // Filter by region
    if (this.selectedRegionFilter !== 'all') {
      filtered = filtered.filter((r) => r.region === this.selectedRegionFilter);
    }

    // Sort reviews
    if (this.selectedSortFilter === 'recent') {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (this.selectedSortFilter === 'highest') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (this.selectedSortFilter === 'lowest') {
      filtered.sort((a, b) => a.rating - b.rating);
    }

    this.filteredReviews = filtered;
    this.currentReviewsPage = 1; // Reset to first page
  }

  onRatingFilterChange(value: string): void {
    this.selectedRatingFilter = value;
    this.applyReviewFilters();
  }

  onRegionFilterChange(value: string): void {
    this.selectedRegionFilter = value;
    this.applyReviewFilters();
  }

  onSortFilterChange(value: string): void {
    this.selectedSortFilter = value;
    this.applyReviewFilters();
  }

  previousReviewsPage(): void {
    if (this.currentReviewsPage > 1) {
      this.currentReviewsPage--;
    }
  }

  nextReviewsPage(): void {
    if (this.currentReviewsPage < this.totalReviewPages) {
      this.currentReviewsPage++;
    }
  }
}
