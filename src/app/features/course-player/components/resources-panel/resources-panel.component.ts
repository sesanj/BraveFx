import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Resource } from '../../../../core/models/course.model';
import { FileText, Download, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-resources-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './resources-panel.component.html',
  styleUrl: './resources-panel.component.css',
})
export class ResourcesPanelComponent {
  @Input() resources: Resource[] = [];

  // Icons
  FileText = FileText;
  Download = Download;

  getResourceIcon(type: string): any {
    switch (type) {
      case 'pdf':
        return FileText;
      case 'excel':
        return FileText;
      default:
        return Download;
    }
  }
}
