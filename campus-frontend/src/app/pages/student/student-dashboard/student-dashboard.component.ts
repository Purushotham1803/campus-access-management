import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { OutingRequest } from '../../../models/models';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule],
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
  requestingReturn = false;

  constructor(
    private auth: AuthService,
    private accessService: AccessService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

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

  // The outing currently keeping them out: the most recent APPROVED request
  // that hasn't been marked actually-returned yet.
  get activeOutingRequest(): OutingRequest | null {
    return this.requests.find(r => r.status === 'APPROVED' && !r.actualReturnTime) || null;
  }

  get canRequestReturn(): boolean {
    const status = this.activeOutingRequest?.returnStatus;
    return this.campusStatus === 'OUT' && !!this.activeOutingRequest && (!status || status === 'NONE' || status === 'REJECTED');
  }

  requestReturn() {
    const req = this.activeOutingRequest;
    if (!req) return;
    this.requestingReturn = true;
    this.accessService.requestReturn(req.id, this.userId).subscribe({
      next: (updated) => {
        this.requestingReturn = false;
        const idx = this.requests.findIndex(r => r.id === updated.id);
        if (idx >= 0) this.requests[idx] = updated;
        this.snackBar.open('Return request sent — waiting for admin approval.', 'OK', { duration: 4000 });
      },
      error: (err) => {
        this.requestingReturn = false;
        this.snackBar.open(err?.error || 'Could not request return.', 'Dismiss', { duration: 3000 });
      }
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
