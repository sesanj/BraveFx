import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton-loader.component.html',
  styleUrls: ['./skeleton-loader.component.css'],
})
export class SkeletonLoaderComponent {
  @Input() type: 'course-player' | 'video' | 'quiz' = 'course-player';

  // Generate array for repeating skeleton items
  skeletonItems = Array(6).fill(0);
}
