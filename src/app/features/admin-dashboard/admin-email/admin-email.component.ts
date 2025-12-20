import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail } from 'lucide-angular';

@Component({
  selector: 'app-admin-email',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin-email.component.html',
  styleUrl: './admin-email.component.css',
})
export class AdminEmailComponent {
  MailIcon = Mail;
}
