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
  private vimeoVideoId = '1147117107';
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
    // Vimeo embed URL with autoplay
    const url = `https://player.vimeo.com/video/${this.vimeoVideoId}?autoplay=1&title=0&byline=0&portrait=0`;
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  closePreview() {
    this.isPreviewOpen = false;
    this.sanitizedPreviewUrl =
      this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }
}
