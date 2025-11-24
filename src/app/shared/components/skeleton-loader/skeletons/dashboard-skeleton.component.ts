import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Stats Grid Skeleton -->
    <div *ngIf="type === 'stats'" class="stats-skeleton">
      <div class="stat-card-skeleton" *ngFor="let item of statsItems">
        <div class="skeleton-icon-circle"></div>
        <div class="skeleton-stat-content">
          <div class="skeleton-stat-value"></div>
          <div class="skeleton-stat-label"></div>
        </div>
      </div>
    </div>

    <!-- Course Cards Skeleton -->
    <div *ngIf="type === 'courses'" class="courses-skeleton">
      <div class="course-card-skeleton" *ngFor="let item of skeletonItems">
        <div class="skeleton-header">
          <div class="skeleton-badge"></div>
        </div>
        <div class="skeleton-body">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-progress-bar"></div>
          <div class="skeleton-footer">
            <div class="skeleton-button"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity List Skeleton -->
    <div *ngIf="type === 'activities'" class="activities-skeleton">
      <div class="activity-item-skeleton" *ngFor="let item of activityItems">
        <div class="skeleton-icon"></div>
        <div class="skeleton-content">
          <div class="skeleton-title"></div>
          <div class="skeleton-course"></div>
          <div class="skeleton-time"></div>
        </div>
      </div>
    </div>

    <!-- Course Progress Skeleton -->
    <div *ngIf="type === 'course-progress'" class="course-progress-skeleton">
      <div
        class="course-progress-item-skeleton"
        *ngFor="let item of courseProgressItems"
      >
        <div class="skeleton-course-info">
          <div class="skeleton-course-icon"></div>
          <div class="skeleton-course-details">
            <div class="skeleton-course-title"></div>
            <div class="skeleton-course-stats"></div>
          </div>
        </div>
        <div class="skeleton-progress-bar-container">
          <div class="skeleton-progress-bar"></div>
          <div class="skeleton-percentage"></div>
        </div>
      </div>
    </div>

    <!-- Quiz Performance Skeleton -->
    <div *ngIf="type === 'quiz-performance'" class="quiz-performance-skeleton">
      <div class="quiz-item-skeleton" *ngFor="let item of quizPerformanceItems">
        <div class="skeleton-quiz-header">
          <div class="skeleton-quiz-title"></div>
          <div class="skeleton-quiz-score"></div>
        </div>
        <div class="skeleton-quiz-meta">
          <div class="skeleton-quiz-course"></div>
          <div class="skeleton-quiz-date"></div>
        </div>
      </div>
    </div>

    <!-- Resources Skeleton -->
    <div *ngIf="type === 'resources'" class="resources-skeleton">
      <div class="resource-group-skeleton" *ngFor="let group of resourceGroups">
        <!-- Course Header -->
        <div class="skeleton-resource-header">
          <div class="skeleton-resource-title"></div>
          <div class="skeleton-resource-badge"></div>
        </div>

        <!-- Modules List -->
        <div class="skeleton-modules-list">
          <div
            class="resource-module-skeleton"
            *ngFor="let module of resourceModules"
          >
            <!-- Module Header (Button) -->
            <div class="skeleton-module-header">
              <div class="skeleton-module-info">
                <div class="skeleton-module-title"></div>
                <div class="skeleton-file-count"></div>
              </div>
              <div class="skeleton-chevron"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard-skeleton.component.css'],
})
export class DashboardSkeletonComponent {
  @Input() type:
    | 'stats'
    | 'courses'
    | 'activities'
    | 'course-progress'
    | 'quiz-performance'
    | 'resources' = 'courses';
  @Input() count: number = 3;

  get statsItems() {
    return Array(4).fill(0); // 4 stat cards
  }

  get skeletonItems() {
    return Array(this.count).fill(0);
  }

  get activityItems() {
    return Array(5).fill(0); // Always show 5 activity skeletons
  }

  get courseProgressItems() {
    return Array(this.count || 3).fill(0); // Course progress items
  }

  get quizPerformanceItems() {
    return Array(this.count || 5).fill(0); // Quiz performance items
  }

  get resourceGroups() {
    return Array(this.count || 2).fill(0); // Resource groups (courses)
  }

  get resourceModules() {
    return Array(3).fill(0); // Modules per course
  }
}
