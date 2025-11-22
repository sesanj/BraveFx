import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, ArrowRight, Shield } from 'lucide-angular';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.css'],
})
export class CtaComponent {
  @Output() enrollClick = new EventEmitter<void>();

  // Icons
  ArrowRight = ArrowRight;
  Shield = Shield;

  onEnrollClick(): void {
    this.enrollClick.emit();
  }
}
