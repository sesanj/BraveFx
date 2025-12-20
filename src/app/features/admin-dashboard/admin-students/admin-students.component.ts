import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Mail, Calendar } from 'lucide-angular';
import { EnrollmentService } from '../../../core/services/enrollment.service';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './admin-students.component.html',
  styleUrl: './admin-students.component.css',
})
export class AdminStudentsComponent implements OnInit {
  students: any[] = [];
  filteredStudents: any[] = [];
  searchTerm = '';
  loading = true;
  SearchIcon = Search;
  MailIcon = Mail;
  CalendarIcon = Calendar;

  constructor(private enrollmentService: EnrollmentService) {}

  async ngOnInit() {
    await this.loadStudents();
  }

  private async loadStudents() {
    try {
      const enrollments = await this.enrollmentService.getAllEnrollments();
      this.students = enrollments.map((e: any) => ({
        id: e.user_id,
        email: e.profiles?.email || 'N/A',
        enrolledAt: e.enrolled_at,
        progress: e.progress || 0,
        lastActive: e.last_accessed_at || e.enrolled_at,
      }));
      this.filteredStudents = [...this.students];
      this.loading = false;
    } catch (error) {
      console.error('Error loading students:', error);
      this.loading = false;
    }
  }

  filterStudents() {
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(
      (s) =>
        s.email.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term)
    );
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
