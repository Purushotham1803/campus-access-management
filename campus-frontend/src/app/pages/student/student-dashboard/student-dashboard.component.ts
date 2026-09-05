import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { OutingRequest } from '../../../models/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.scss']
})
export class StudentDashboardComponent implements OnInit {
  username = this.auth.getUsername();
  userId = this.auth.getUserId();
  role = this.auth.getRole();
  requests: OutingRequest[] = [];
  loading = true;
  campusStatus = 'IN';
  department: string | null = null;

  constructor(private auth: AuthService, private accessService: AccessService, private userService: UserService) {}

  ngOnInit() {
    this.accessService.getMyRequests(this.userId).subscribe({
      next: (data) => { this.requests = [...data].sort((a, b) => b.id - a.id); this.loading = false; },
      error: () => this.loading = false
    });
    this.userService.getUserProfile(this.userId).subscribe({
      next: (u) => { this.campusStatus = u.campusStatus; this.department = u.department ?? null; },
      error: () => {}
    });
  }

  get totalRequests() { return this.requests.length; }
  get pendingCount() { return this.requests.filter(r => r.status === 'PENDING').length; }
  get approvedCount() { return this.requests.filter(r => r.status === 'APPROVED').length; }
  get recentRequests() { return this.requests.slice(0, 5); }

  getStatusColor(status: string): string {
    const map: Record<string, string> = { PENDING: 'accent', APPROVED: 'primary', REJECTED: 'warn', CANCELLED: '', EXPIRED: '' };
    return map[status] || '';
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
