import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Settings as SettingsIcon } from 'lucide-angular';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent {
  SettingsIcon = SettingsIcon;
}
