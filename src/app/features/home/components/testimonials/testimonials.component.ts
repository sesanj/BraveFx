import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
export class TestimonialsComponent implements OnInit {
  @Input() reviewsData: any = null;
  @Input() featuredReviews: any[] = [];
  @Input() allReviews: any[] = [];
  @Input() filteredReviews: any[] = [];
  @Input() currentCarouselIndex = 0;
  @Input() isReviewsModalOpen = false;
  @Input() isSingleReviewModalOpen = false;
  @Input() selectedReview: any = null;
  @Input() selectedRatingFilter = 'all';
  @Input() selectedRegionFilter = 'all';
  @Input() selectedSortFilter = 'recent';
  @Input() currentReviewsPage = 1;
  @Input() reviewsPerPage = 12;

  @Output() openReviewsModalEvent = new EventEmitter<void>();
  @Output() closeReviewsModalEvent = new EventEmitter<void>();
  @Output() openSingleReviewModalEvent = new EventEmitter<any>();
  @Output() closeSingleReviewModalEvent = new EventEmitter<void>();
  @Output() previousSlideEvent = new EventEmitter<void>();
  @Output() nextSlideEvent = new EventEmitter<void>();
  @Output() applyReviewFiltersEvent = new EventEmitter<void>();
  @Output() previousReviewsPageEvent = new EventEmitter<void>();
  @Output() nextReviewsPageEvent = new EventEmitter<void>();
  @Output() ratingFilterChange = new EventEmitter<string>();
  @Output() regionFilterChange = new EventEmitter<string>();
  @Output() sortFilterChange = new EventEmitter<string>();

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

  get totalCarouselSlides(): number {
    return Math.ceil(this.featuredReviews.length / 3);
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

  ngOnInit(): void {}

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
    this.openReviewsModalEvent.emit();
  }

  closeReviewsModal(): void {
    this.closeReviewsModalEvent.emit();
  }

  openSingleReviewModal(review: any): void {
    this.openSingleReviewModalEvent.emit(review);
  }

  closeSingleReviewModal(): void {
    this.closeSingleReviewModalEvent.emit();
  }

  previousSlide(): void {
    this.previousSlideEvent.emit();
  }

  nextSlide(): void {
    this.nextSlideEvent.emit();
  }

  goToSlide(index: number): void {
    // Emit event to parent to change slide
    const direction = index > this.currentCarouselIndex ? 'next' : 'previous';
    const steps = Math.abs(index - this.currentCarouselIndex);

    for (let i = 0; i < steps; i++) {
      if (direction === 'next') {
        this.nextSlideEvent.emit();
      } else {
        this.previousSlideEvent.emit();
      }
    }
  }

  applyReviewFilters(): void {
    this.applyReviewFiltersEvent.emit();
  }

  onRatingFilterChange(value: string): void {
    this.ratingFilterChange.emit(value);
    this.applyReviewFiltersEvent.emit();
  }

  onRegionFilterChange(value: string): void {
    this.regionFilterChange.emit(value);
    this.applyReviewFiltersEvent.emit();
  }

  onSortFilterChange(value: string): void {
    this.sortFilterChange.emit(value);
    this.applyReviewFiltersEvent.emit();
  }

  previousReviewsPage(): void {
    this.previousReviewsPageEvent.emit();
  }

  nextReviewsPage(): void {
    this.nextReviewsPageEvent.emit();
  }
}
