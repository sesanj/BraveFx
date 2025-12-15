import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { CampaignBannerComponent } from './components/campaign-banner/campaign-banner.component';
import { StickyCampaignBarComponent } from '../../shared/components/sticky-campaign-bar/sticky-campaign-bar.component';
import { LearningOutcomesComponent } from './components/learning-outcomes/learning-outcomes.component';
import { CourseCurriculumComponent } from './components/course-curriculum/course-curriculum.component';
import { WhyBravefxComponent } from './components/why-bravefx/why-bravefx.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { CtaComponent } from './components/cta/cta.component';
import { TawkChatComponent } from '../../shared/components/tawk-chat/tawk-chat.component';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroComponent,
    CampaignBannerComponent,
    StickyCampaignBarComponent,
    LearningOutcomesComponent,
    CourseCurriculumComponent,
    WhyBravefxComponent,
    TestimonialsComponent,
    PricingComponent,
    CtaComponent,
    TawkChatComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild(CampaignBannerComponent) campaignBanner!: CampaignBannerComponent;

  constructor(private seoService: SeoService) {}

  ngOnInit() {
    this.seoService.updateMetaTags({
      title: 'BraveFx Academy - Master Forex Trading with Expert Guidance',
      description:
        'Join 6,000+ students learning forex trading from expert traders. Comprehensive video courses, quizzes, and lifetime access. 38K+ Instagram followers, 70K+ YouTube subscribers.',
      keywords:
        'forex trading, forex course, trading education, forex academy, online trading course, learn forex',
      url: 'https://bravefx.io/',
      image: 'https://bravefx.io/assets/og-image.jpg',
    });
  }
  // Smooth scroll to pricing section
  scrollToEnroll() {
    const enrollSection = document.getElementById('enroll');
    enrollSection?.scrollIntoView({ behavior: 'smooth' });
  }

  // Smooth scroll to curriculum section
  scrollToCurriculum() {
    const curriculumSection = document.getElementById('curriculum');
    curriculumSection?.scrollIntoView({ behavior: 'smooth' });
  }
}
