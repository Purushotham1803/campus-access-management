import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApprovalService } from '../../../services/approval.service';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { OutingRequest, PendingReturn, User } from '../../../models/models';

type Tab = 'OUTGOING' | 'RETURN';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, MatSnackBarModule],
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.scss']
})
export class AdminRequestsComponent implements OnInit {
  tab: Tab = 'OUTGOING';
  loading = true;
  processing = false;
  requests: OutingRequest[] = [];
  returns: PendingReturn[] = [];
  userMap: Partial<Record<number, User>> = {};
  expandedId: number | null = null;
  reason = '';

  constructor(
    private approvalService: ApprovalService,
    private accessService: AccessService,
    private userService: UserService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    forkJoin({
      pending: this.approvalService.getPending(),
      returns: this.accessService.getPendingReturns(),
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ pending, returns, users }) => {
        this.requests = [...pending].sort((a, b) => b.id - a.id);
        this.returns = [...returns].sort((a, b) => a.passId - b.passId);
        this.userMap = Object.fromEntries(users.map(u => [u.id, u]));
        this.loading = false;
      },
      error: () => { this.loading = false; this.snackBar.open('Could not load pending requests.', 'Dismiss', { duration: 3000 }); }
    });
  }

  requesterName(userId: number): string {
    return this.userMap[userId]?.username || `User #${userId}`;
  }

  toggle(req: OutingRequest) {
    this.expandedId = this.expandedId === req.id ? null : req.id;
    this.reason = '';
  }

  decide(req: OutingRequest, status: 'APPROVED' | 'REJECTED') {
    this.processing = true;
    this.approvalService.submitApproval({
      requestId: req.id,
      adminId: this.auth.getUserId(),
      status,
      reason: this.reason || (status === 'APPROVED' ? 'Approved' : 'Rejected')
    }).subscribe({
      next: () => {
        this.processing = false;
        this.expandedId = null;
        this.snackBar.open(`Request ${status.toLowerCase()}.`, 'OK', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        this.processing = false;
        this.snackBar.open(err?.error || 'Could not process request.', 'Dismiss', { duration: 3000 });
      }
    });
  }

  decideReturn(ret: PendingReturn, approve: boolean) {
    this.processing = true;
    this.accessService.approveReturn(ret.passId, approve).subscribe({
      next: () => {
        this.processing = false;
        this.snackBar.open(`Return ${approve ? 'approved' : 'rejected'}.`, 'OK', { duration: 2500 });
        this.load();
      },
      error: (err) => {
        this.processing = false;
        this.snackBar.open(err?.error || 'Could not process return request.', 'Dismiss', { duration: 3000 });
      }
    });
  }
}
