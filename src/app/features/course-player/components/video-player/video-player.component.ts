import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl } from '@angular/platform-browser';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.css',
})
export class VideoPlayerComponent {
  @Input() videoUrl: SafeResourceUrl | null = null;
  @Input() lessonProgress: number = 0;
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;
  @Input() isLoading: boolean = false;

  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();
  @Output() markComplete = new EventEmitter<void>();

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  Check = Check;
  Play = Play;

  onPrevious(): void {
    this.previous.emit();
  }

  onNext(): void {
    this.next.emit();
  }

  onMarkComplete(): void {
    this.markComplete.emit();
  }
}
