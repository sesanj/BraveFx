import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';
import { LearningOutcomesComponent } from './components/learning-outcomes/learning-outcomes.component';
import { CourseCurriculumComponent } from './components/course-curriculum/course-curriculum.component';
import { WhyBravefxComponent } from './components/why-bravefx/why-bravefx.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { PricingComponent } from './components/pricing/pricing.component';
import { CtaComponent } from './components/cta/cta.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroComponent,
    LearningOutcomesComponent,
    CourseCurriculumComponent,
    WhyBravefxComponent,
    TestimonialsComponent,
    PricingComponent,
    CtaComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
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
