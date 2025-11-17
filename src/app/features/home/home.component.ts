import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { ReviewService } from '../../core/services/review.service';
import { Course } from '../../core/models/course.model';
import { Review } from '../../core/models/review.model';
import {
  LucideAngularModule,
  GraduationCap,
  TrendingUp,
  Download,
  CheckCircle,
  Users,
  Clock,
  PlayCircle,
  Star,
  Shield,
  Zap,
  BarChart3,
  Trophy,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Tag,
  Target,
  BookOpen,
  FileText,
  Infinity,
  ChevronDown,
  MapPin,
  Award,
  Package,
  CheckCircle2,
  ArrowRight,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Lightbulb,
  Brain,
  LineChart,
  Wallet,
  BookMarked,
  AlertCircle,
  Instagram,
  Youtube,
  X,
  Filter,
  ChevronLeft,
  Globe,
  ClipboardCheck,
  Smartphone,
} from 'lucide-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  course: Course | null = null;
  isPreviewOpen = false;
  isAllSectionsModalOpen = false;

  // Reviews Modal & Data
  isReviewsModalOpen = false;
  reviewsData: any = null;
  featuredReviews: any[] = [];
  allReviews: any[] = [];
  filteredReviews: any[] = [];
  currentReviewsPage = 1;
  reviewsPerPage = 12;

  // Featured Reviews Carousel
  currentCarouselIndex = 0;
  reviewsPerSlide = 3;

  // Single Review Modal
  isSingleReviewModalOpen = false;
  selectedReview: any = null;

  // Review Filters
  selectedRatingFilter = 'all';
  selectedRegionFilter = 'all';
  selectedSortFilter = 'recent';

  private previewBaseUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  sanitizedPreviewUrl!: SafeResourceUrl;

  // Icons
  readonly GraduationCap = GraduationCap;
  readonly TrendingUp = TrendingUp;
  readonly Download = Download;
  readonly CheckCircle = CheckCircle;
  readonly CheckCircle2 = CheckCircle2;
  readonly Users = Users;
  readonly Clock = Clock;
  readonly PlayCircle = PlayCircle;
  readonly Star = Star;
  readonly Shield = Shield;
  readonly ShieldCheck = ShieldCheck;
  readonly Zap = Zap;
  readonly BarChart3 = BarChart3;
  readonly Trophy = Trophy;
  readonly MessageCircle = MessageCircle;
  readonly ChevronRight = ChevronRight;
  readonly ChevronDown = ChevronDown;
  readonly Sparkles = Sparkles;
  readonly Tag = Tag;
  readonly Target = Target;
  readonly BookOpen = BookOpen;
  readonly FileText = FileText;
  readonly Infinity = Infinity;
  readonly MapPin = MapPin;
  readonly Award = Award;
  readonly Package = Package;
  readonly ArrowRight = ArrowRight;
  readonly Lock = Lock;
  readonly Minus = Minus;
  readonly Plus = Plus;
  readonly Lightbulb = Lightbulb;
  readonly Brain = Brain;
  readonly LineChart = LineChart;
  readonly Wallet = Wallet;
  readonly BookMarked = BookMarked;
  readonly AlertCircle = AlertCircle;
  readonly Instagram = Instagram;
  readonly Youtube = Youtube;
  readonly X = X;
  readonly Filter = Filter;
  readonly ChevronLeft = ChevronLeft;
  readonly Globe = Globe;
  readonly ClipboardCheck = ClipboardCheck;
  readonly Smartphone = Smartphone;

  learningOutcomes = [
    {
      icon: Brain,
      title: 'Master Technical Analysis',
      description:
        'Read charts like a pro. Learn price action, candlestick patterns, support & resistance, proven indicators, and more.',
    },
    {
      icon: LineChart,
      title: 'Develop Winning Strategies',
      description:
        'Build and backtest profitable trading strategies that work in any market condition.',
    },
    {
      icon: Wallet,
      title: 'Perfect Risk Management',
      description:
        'Protect your capital with professional risk management and position sizing techniques.',
    },
    {
      icon: Zap,
      title: 'Execute with Confidence',
      description:
        'Master trading psychology and eliminate emotional decision-making for consistent results.',
    },
    {
      icon: TrendingUp,
      title: 'Spot High-Probability Trades',
      description:
        'Identify the best trading opportunities with multi-timeframe analysis.',
    },
    {
      icon: BookMarked,
      title: 'Build a Trading Plan',
      description:
        'Create your personalized trading plan and journal for continuous improvement.',
    },
  ];

  // Why Learn From Us - Stats
  whyBraveFxStats = {
    students: '6,000+',
    youtubeFollowers: '75K',
    instagramFollowers: '38K',
    tiktokFollowers: '5K',
    discordMembers: '3K',
    reviews: '1,700+',
    rating: 4.6,
  };

  whyBraveFx = [
    {
      icon: Trophy,
      title: '10+ Years Experience',
      description:
        'Learn from a seasoned trader with over a decade of real market experience. Not a weekend course creator—actual trading expertise.',
    },
    {
      icon: Lightbulb,
      title: 'Battle-Tested Strategies',
      description:
        'Proven strategies used by professional traders, not theory from textbooks. Real market experience translated into actionable lessons.',
    },
    {
      icon: Users,
      title: 'Lifetime Community Support',
      description:
        "Join our active Discord community. Get ongoing support, share trades, and grow with traders at every level. You're never alone.",
    },
  ];

  faqs = [
    {
      question: 'Is this course suitable for complete beginners?',
      answer:
        'Absolutely! This course is designed to take you from zero knowledge to confident trader. We start with the basics and progressively build your skills. No prior trading experience required.',
      isOpen: false,
    },
    {
      question: 'How long do I have access to the course?',
      answer:
        'You get lifetime access! Learn at your own pace, revisit lessons anytime, and benefit from all future updates at no additional cost.',
      isOpen: false,
    },
    {
      question: "What if I'm not satisfied with the course?",
      answer:
        "We offer a 30-day money-back guarantee. If you're not completely satisfied within the first 30 days, simply email us for a full refund. No questions asked.",
      isOpen: false,
    },
    {
      question: 'Do I need a large amount of capital to start?',
      answer:
        'No! You can start practicing with a demo account (free) and when ready, begin live trading with as little as $100. We teach you how to manage risk regardless of account size.',
      isOpen: false,
    },
    {
      question: 'How is this different from free YouTube content?',
      answer:
        'This is a structured, comprehensive curriculum that takes you step-by-step from beginner to advanced. Plus, you get community access, downloadable resources, trading tools, and ongoing support—all in one place.',
      isOpen: false,
    },
  ];

  features = [
    {
      icon: GraduationCap,
      title: 'Comprehensive Curriculum',
      description:
        '25+ hours of expert-led video lessons covering beginner to advanced strategies',
    },
    {
      icon: TrendingUp,
      title: 'Real Trading Examples',
      description:
        'Learn from actual market scenarios and live trading demonstrations',
    },
    {
      icon: Download,
      title: '50+ Resources',
      description: 'Downloadable PDFs, cheat sheets, and trading calculators',
    },
    {
      icon: CheckCircle,
      title: 'Skill Tests',
      description:
        'Validate your knowledge with quizzes and practical assessments',
    },
    {
      icon: Users,
      title: 'Community Access',
      description:
        'Join a community of 6,000+ traders and get your questions answered',
    },
    {
      icon: Clock,
      title: 'Lifetime Access',
      description:
        'Learn at your own pace with unlimited access to all course materials',
    },
  ];

  constructor(
    private courseService: CourseService,
    private reviewService: ReviewService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Load first available course from database
    this.courseService.getAllCourses().subscribe((courses) => {
      if (courses && courses.length > 0) {
        // Get full course details with modules and lessons
        this.courseService.getCourse(courses[0].id).subscribe((course) => {
          this.course = course;
          // Add isOpen property to each module for accordion functionality
          this.course.modules.forEach((module) => {
            (module as any).isOpen = false;
          });
        });
      }
    });

    // Load reviews data from both JSON and database
    this.loadReviewsData();
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

        // Now fetch reviews from database and merge them
        this.reviewService.getAllReviews(1, 100).subscribe({
          next: (dbReviews) => {
            console.log('=== DATABASE REVIEWS DEBUG ===');
            console.log('Total DB reviews fetched:', dbReviews.length);
            console.log('Raw database reviews:', dbReviews);

            // Log each review's text field specifically
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

  // Open Reviews Modal
  openReviewsModal() {
    this.isReviewsModalOpen = true;
    this.applyReviewFilters();
  }

  // Close Reviews Modal
  closeReviewsModal() {
    this.isReviewsModalOpen = false;
  }

  // Open Single Review Modal
  openSingleReviewModal(review: any) {
    this.selectedReview = review;
    this.isSingleReviewModalOpen = true;
  }

  // Close Single Review Modal
  closeSingleReviewModal() {
    this.isSingleReviewModalOpen = false;
    this.selectedReview = null;
  }

  // Apply review filters
  applyReviewFilters() {
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

  // Get paginated reviews
  get paginatedReviews() {
    const start = (this.currentReviewsPage - 1) * this.reviewsPerPage;
    const end = start + this.reviewsPerPage;
    return this.filteredReviews.slice(start, end);
  }

  // Get total pages
  get totalReviewPages() {
    return Math.ceil(this.filteredReviews.length / this.reviewsPerPage);
  }

  // Navigate reviews pages
  nextReviewsPage() {
    if (this.currentReviewsPage < this.totalReviewPages) {
      this.currentReviewsPage++;
    }
  }

  previousReviewsPage() {
    if (this.currentReviewsPage > 1) {
      this.currentReviewsPage--;
    }
  }

  // Get unique regions for filter dropdown
  get uniqueRegions() {
    const regions = new Set(this.allReviews.map((r) => r.region));
    return Array.from(regions).sort();
  }

  // Get star array for rendering
  getStarArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  // Get top regions for display
  getTopRegions() {
    if (!this.reviewsData?.regionalBreakdown) return [];

    return Object.entries(this.reviewsData.regionalBreakdown)
      .map(([name, data]: [string, any]) => ({
        name,
        percentage: data.percentage,
        count: data.count,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // Top 5 regions
  }

  // Carousel Navigation
  get visibleReviews() {
    const start = this.currentCarouselIndex * this.reviewsPerSlide;
    return this.featuredReviews.slice(start, start + this.reviewsPerSlide);
  }

  get totalCarouselSlides() {
    return 3; // 3 slides: 3 reviews each (9 total)
  }

  get canGoPrevious() {
    return this.currentCarouselIndex > 0;
  }

  get canGoNext() {
    return this.currentCarouselIndex < this.totalCarouselSlides - 1;
  }

  previousSlide() {
    if (this.canGoPrevious) {
      this.currentCarouselIndex--;
    }
  }

  nextSlide() {
    if (this.canGoNext) {
      this.currentCarouselIndex++;
    }
  }

  scrollToEnroll() {
    const enrollSection = document.getElementById('enroll');
    enrollSection?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToCurriculum() {
    const curriculumSection = document.getElementById('curriculum');
    curriculumSection?.scrollIntoView({ behavior: 'smooth' });
  }

  openPreview() {
    this.isPreviewOpen = true;
    const url = `${this.previewBaseUrl}?autoplay=1&modestbranding=1&rel=0`;
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closePreview() {
    this.isPreviewOpen = false;
    // Stop video playback by navigating iframe to blank
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }

  toggleSection(index: number) {
    if (this.course && this.course.modules[index]) {
      (this.course.modules[index] as any).isOpen = !(
        this.course.modules[index] as any
      ).isOpen;
    }
  }

  toggleFaq(index: number) {
    this.faqs[index].isOpen = !this.faqs[index].isOpen;
  }

  openAllSectionsModal() {
    this.isAllSectionsModalOpen = true;
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  closeAllSectionsModal() {
    this.isAllSectionsModalOpen = false;
    document.body.style.overflow = ''; // Restore scroll
  }
}
