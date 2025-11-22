import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  LucideAngularModule,
  Sparkles,
  CheckCircle,
  ChevronRight,
  PlayCircle,
  Users,
  Star,
  Instagram,
  Youtube,
} from 'lucide-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HeroComponent {
  @Output() enrollClick = new EventEmitter<void>();

  isPreviewOpen = false;
  private previewBaseUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  sanitizedPreviewUrl!: SafeResourceUrl;

  // Icons
  readonly Sparkles = Sparkles;
  readonly CheckCircle = CheckCircle;
  readonly ChevronRight = ChevronRight;
  readonly PlayCircle = PlayCircle;
  readonly Users = Users;
  readonly Star = Star;
  readonly Instagram = Instagram;
  readonly Youtube = Youtube;

  constructor(private sanitizer: DomSanitizer) {}

  scrollToEnroll() {
    this.enrollClick.emit();
  }

  openPreview() {
    this.isPreviewOpen = true;
    const url = `${this.previewBaseUrl}?autoplay=1&modestbranding=1&rel=0`;
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
}
