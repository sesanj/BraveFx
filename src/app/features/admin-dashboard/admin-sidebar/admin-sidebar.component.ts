import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Star,
  BookOpen,
  Tag,
  Mail,
  Settings,
  LucideAngularModule,
} from 'lucide-angular';

interface NavItem {
  label: string;
  route: string;
  icon: any;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent {
  navItems: NavItem[] = [
    { label: 'Overview', route: '/admin/overview', icon: LayoutDashboard },
    { label: 'Revenue', route: '/admin/revenue', icon: CreditCard },
    { label: 'Students', route: '/admin/students', icon: Users },
    { label: 'Reviews', route: '/admin/reviews', icon: Star },
    { label: 'Content', route: '/admin/content', icon: BookOpen },
    { label: 'Coupons', route: '/admin/coupons', icon: Tag },
    { label: 'Email', route: '/admin/email', icon: Mail },
    { label: 'Settings', route: '/admin/settings', icon: Settings },
  ];
}
