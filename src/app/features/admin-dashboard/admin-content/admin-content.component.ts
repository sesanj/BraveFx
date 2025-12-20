import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, BookOpen } from 'lucide-angular';

@Component({
  selector: 'app-admin-content',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.css',
})
export class AdminContentComponent {
  BookOpenIcon = BookOpen;
}
