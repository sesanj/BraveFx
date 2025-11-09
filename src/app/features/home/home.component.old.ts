import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';
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

  courseSections = [
    {
      title: 'Forex Fundamentals & Market Structure',
      lessons: 18,
      duration: '2h 45m',
      isOpen: false,
      lessonsList: [
        { title: 'Welcome to Forex Trading', duration: '8:24', type: 'video' },
        {
          title: 'How the Forex Market Works',
          duration: '12:15',
          type: 'video',
        },
        { title: 'Currency Pairs Explained', duration: '10:32', type: 'video' },
        {
          title: 'Trading Sessions & Market Hours',
          duration: '9:18',
          type: 'video',
        },
        {
          title: 'Understanding Pips, Lots & Leverage',
          duration: '11:45',
          type: 'video',
        },
        { title: 'Market Structure Basics', duration: '14:20', type: 'video' },
        {
          title: 'Quiz: Forex Fundamentals',
          duration: '10 questions',
          type: 'quiz',
        },
        {
          title: 'Forex Terminology Cheat Sheet',
          duration: 'PDF',
          type: 'resource',
        },
      ],
    },
    {
      title: 'Technical Analysis Mastery',
      lessons: 32,
      duration: '5h 20m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Introduction to Technical Analysis',
          duration: '9:30',
          type: 'video',
        },
        {
          title: 'Candlestick Patterns Part 1',
          duration: '15:42',
          type: 'video',
        },
        {
          title: 'Candlestick Patterns Part 2',
          duration: '16:18',
          type: 'video',
        },
        {
          title: 'Support & Resistance Zones',
          duration: '18:25',
          type: 'video',
        },
        { title: 'Trend Lines & Channels', duration: '12:50', type: 'video' },
        {
          title: 'Chart Patterns: Flags & Pennants',
          duration: '14:35',
          type: 'video',
        },
        { title: 'Moving Averages Strategy', duration: '11:20', type: 'video' },
        { title: 'RSI & MACD Indicators', duration: '13:45', type: 'video' },
      ],
    },
    {
      title: 'Risk Management & Position Sizing',
      lessons: 15,
      duration: '3h 10m',
      isOpen: false,
      lessonsList: [
        {
          title: 'The Importance of Risk Management',
          duration: '10:15',
          type: 'video',
        },
        {
          title: 'Position Sizing Calculator',
          duration: '12:30',
          type: 'video',
        },
        { title: 'Stop Loss Strategies', duration: '14:20', type: 'video' },
        { title: 'Risk-Reward Ratios', duration: '11:45', type: 'video' },
        { title: 'Portfolio Diversification', duration: '9:50', type: 'video' },
        {
          title: 'Risk Management Calculator',
          duration: 'Excel',
          type: 'resource',
        },
      ],
    },
    {
      title: 'Trading Strategies & Systems',
      lessons: 28,
      duration: '4h 50m',
      isOpen: false,
      lessonsList: [
        { title: 'Scalping Strategies', duration: '16:20', type: 'video' },
        { title: 'Day Trading Setups', duration: '18:45', type: 'video' },
        { title: 'Swing Trading Techniques', duration: '15:30', type: 'video' },
        { title: 'Trend Following Systems', duration: '14:25', type: 'video' },
        {
          title: 'Breakout Trading Strategy',
          duration: '12:40',
          type: 'video',
        },
        { title: 'Range Trading Systems', duration: '11:55', type: 'video' },
      ],
    },
    {
      title: 'Trading Psychology & Mindset',
      lessons: 12,
      duration: '2h 15m',
      isOpen: false,
      lessonsList: [
        { title: "The Trader's Mindset", duration: '10:30', type: 'video' },
        { title: 'Overcoming Fear & Greed', duration: '12:15', type: 'video' },
        { title: 'Dealing with Losses', duration: '11:20', type: 'video' },
        { title: 'Building Discipline', duration: '9:45', type: 'video' },
        {
          title: 'Trading Journal Template',
          duration: 'PDF',
          type: 'resource',
        },
      ],
    },
    {
      title: 'Live Trading Examples & Case Studies',
      lessons: 25,
      duration: '4h 30m',
      isOpen: false,
      lessonsList: [
        { title: 'Live Trade Analysis #1', duration: '15:20', type: 'video' },
        { title: 'Live Trade Analysis #2', duration: '18:35', type: 'video' },
        {
          title: 'Real-Time Market Breakdown',
          duration: '20:15',
          type: 'video',
        },
        { title: 'Winning Trade Review', duration: '12:45', type: 'video' },
        { title: 'Learning from Losses', duration: '14:30', type: 'video' },
      ],
    },
    {
      title: 'Advanced Chart Patterns',
      lessons: 22,
      duration: '3h 45m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Head and Shoulders Pattern',
          duration: '16:10',
          type: 'video',
        },
        {
          title: 'Double Top & Double Bottom',
          duration: '14:25',
          type: 'video',
        },
        { title: 'Triangle Patterns', duration: '13:50', type: 'video' },
        { title: 'Wedge Patterns', duration: '12:30', type: 'video' },
        { title: 'Cup and Handle Pattern', duration: '11:45', type: 'video' },
      ],
    },
    {
      title: 'Fibonacci Trading Techniques',
      lessons: 16,
      duration: '2h 50m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Introduction to Fibonacci',
          duration: '10:20',
          type: 'video',
        },
        { title: 'Fibonacci Retracements', duration: '15:40', type: 'video' },
        { title: 'Fibonacci Extensions', duration: '14:15', type: 'video' },
        { title: 'Fibonacci Fan & Arcs', duration: '12:35', type: 'video' },
        { title: 'Trading with Fibonacci', duration: '16:20', type: 'video' },
      ],
    },
    {
      title: 'Price Action Trading',
      lessons: 24,
      duration: '4h 10m',
      isOpen: false,
      lessonsList: [
        { title: 'What is Price Action?', duration: '9:15', type: 'video' },
        { title: 'Reading Naked Charts', duration: '13:45', type: 'video' },
        { title: 'Pin Bar Strategy', duration: '15:30', type: 'video' },
        { title: 'Engulfing Patterns', duration: '14:20', type: 'video' },
        { title: 'Inside Bar Trading', duration: '12:40', type: 'video' },
      ],
    },
    {
      title: 'Multi-Timeframe Analysis',
      lessons: 14,
      duration: '2h 30m',
      isOpen: false,
      lessonsList: [
        { title: 'Top-Down Analysis Method', duration: '11:25', type: 'video' },
        { title: 'Timeframe Correlation', duration: '13:15', type: 'video' },
        { title: 'Entry & Exit Timing', duration: '14:50', type: 'video' },
        { title: 'Conflicting Signals', duration: '10:35', type: 'video' },
      ],
    },
    {
      title: 'Fundamental Analysis for Forex',
      lessons: 20,
      duration: '3h 20m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Economic Indicators Overview',
          duration: '12:30',
          type: 'video',
        },
        { title: 'Interest Rates Impact', duration: '15:20', type: 'video' },
        { title: 'GDP & Employment Data', duration: '13:45', type: 'video' },
        { title: 'Central Bank Policies', duration: '16:10', type: 'video' },
        { title: 'News Trading Strategies', duration: '14:25', type: 'video' },
      ],
    },
    {
      title: 'Market Sentiment & Volume Analysis',
      lessons: 18,
      duration: '3h 00m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Understanding Market Sentiment',
          duration: '11:40',
          type: 'video',
        },
        { title: 'COT Report Analysis', duration: '15:25', type: 'video' },
        { title: 'Volume Profile Trading', duration: '14:35', type: 'video' },
        { title: 'Volume Spread Analysis', duration: '13:20', type: 'video' },
      ],
    },
    {
      title: 'Algorithmic Trading Basics',
      lessons: 26,
      duration: '4h 40m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Introduction to Algo Trading',
          duration: '10:15',
          type: 'video',
        },
        { title: 'Creating Trading Bots', duration: '18:30', type: 'video' },
        { title: 'Backtesting Strategies', duration: '16:45', type: 'video' },
        {
          title: 'Automated Risk Management',
          duration: '15:20',
          type: 'video',
        },
        { title: 'Bot Optimization', duration: '14:10', type: 'video' },
      ],
    },
    {
      title: 'Order Types & Execution',
      lessons: 12,
      duration: '2h 10m',
      isOpen: false,
      lessonsList: [
        { title: 'Market Orders Explained', duration: '9:30', type: 'video' },
        { title: 'Limit Orders Strategy', duration: '11:20', type: 'video' },
        { title: 'Stop Orders & Stop Limit', duration: '13:45', type: 'video' },
        { title: 'OCO & Trailing Stops', duration: '12:15', type: 'video' },
      ],
    },
    {
      title: 'Building Your Trading Plan',
      lessons: 10,
      duration: '1h 50m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Why You Need a Trading Plan',
          duration: '8:45',
          type: 'video',
        },
        { title: 'Setting Realistic Goals', duration: '10:30', type: 'video' },
        { title: 'Creating Your Rulebook', duration: '12:20', type: 'video' },
        { title: 'Trading Plan Template', duration: 'PDF', type: 'resource' },
      ],
    },
    {
      title: 'Advanced Risk Management',
      lessons: 17,
      duration: '3h 05m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Kelly Criterion for Position Sizing',
          duration: '14:40',
          type: 'video',
        },
        {
          title: 'Portfolio Heat Management',
          duration: '13:25',
          type: 'video',
        },
        { title: 'Correlation Risk', duration: '11:50', type: 'video' },
        { title: 'Drawdown Management', duration: '15:10', type: 'video' },
      ],
    },
    {
      title: 'Trading Different Market Conditions',
      lessons: 21,
      duration: '3h 35m',
      isOpen: false,
      lessonsList: [
        { title: 'Trending Markets', duration: '13:20', type: 'video' },
        { title: 'Ranging Markets', duration: '14:45', type: 'video' },
        { title: 'Volatile Markets', duration: '12:30', type: 'video' },
        { title: 'Low Liquidity Periods', duration: '11:15', type: 'video' },
      ],
    },
    {
      title: 'Professional Trading Setups',
      lessons: 30,
      duration: '5h 15m',
      isOpen: false,
      lessonsList: [
        {
          title: 'Institutional Trading Zones',
          duration: '17:20',
          type: 'video',
        },
        { title: 'Smart Money Concepts', duration: '18:45', type: 'video' },
        { title: 'Order Block Trading', duration: '16:30', type: 'video' },
        { title: 'Liquidity Grab Setups', duration: '15:25', type: 'video' },
        { title: 'Fair Value Gaps', duration: '14:10', type: 'video' },
      ],
    },
    {
      title: 'Creating Your Trading Journal',
      lessons: 8,
      duration: '1h 30m',
      isOpen: false,
      lessonsList: [
        { title: 'Why Journaling Matters', duration: '9:20', type: 'video' },
        { title: 'What to Track', duration: '11:45', type: 'video' },
        { title: 'Analyzing Your Trades', duration: '13:30', type: 'video' },
        { title: 'Journal Template', duration: 'Excel', type: 'resource' },
      ],
    },
    {
      title: 'Final Project & Certification',
      lessons: 5,
      duration: '1h 15m',
      isOpen: false,
      lessonsList: [
        { title: 'Course Summary', duration: '12:30', type: 'video' },
        { title: 'Final Assessment', duration: '45 questions', type: 'quiz' },
        {
          title: 'Next Steps in Your Journey',
          duration: '10:20',
          type: 'video',
        },
        {
          title: 'Certificate of Completion',
          duration: 'PDF',
          type: 'resource',
        },
      ],
    },
  ];

  // pricingFeatures = [
  //   '200+ HD Video Lessons',
  //   '45+ Downloadable PDF Resources',
  //   'Lifetime Course Access',
  //   '24/7 Community Support',
  //   'Live Trading Examples',
  //   'Risk Management Tools',
  //   'Trading Plan Templates',
  //   'Skill Assessment Tests',
  //   'Certificate of Completion',
  //   'Monthly Live Q&A Sessions',
  //   'Exclusive Trading Indicators',
  //   'Free Lifetime Updates',
  // ];

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

    // Load reviews data from JSON
    this.loadReviewsData();
  }

  // Load reviews from JSON file
  loadReviewsData() {
    this.http.get<any>('/assets/data/reviews.json').subscribe({
      next: (data) => {
        this.reviewsData = data;
        this.featuredReviews = data.featuredReviews || [];
        this.allReviews = data.allReviews || [];
        this.filteredReviews = [...this.allReviews];
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
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
