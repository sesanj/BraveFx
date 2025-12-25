import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Monitor, Smartphone } from 'lucide-angular';

@Component({
  selector: 'app-platform-preview',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './platform-preview.component.html',
  styleUrl: './platform-preview.component.css',
})
export class PlatformPreviewComponent {
  readonly Monitor = Monitor;
  readonly Smartphone = Smartphone;
}
