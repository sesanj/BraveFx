import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Instagram,
  Youtube,
  Twitter,
  Mail,
  MapPin,
  Phone,
} from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  readonly Instagram = Instagram;
  readonly Youtube = Youtube;
  readonly Twitter = Twitter;
  readonly Mail = Mail;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
}
