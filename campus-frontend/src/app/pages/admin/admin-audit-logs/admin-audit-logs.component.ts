import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApprovalService } from '../../../services/approval.service';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { Approval, OutingRequest, User } from '../../../models/models';

interface AuditRow {
  approval: Approval;
  request?: OutingRequest;
  requesterName: string;
  adminName: string;
}

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './admin-audit-logs.component.html',
  styleUrls: ['./admin-audit-logs.component.scss']
})
export class AdminAuditLogsComponent implements OnInit {
  loading = true;
  rows: AuditRow[] = [];

  constructor(
    private approvalService: ApprovalService,
    private accessService: AccessService,
    private userService: UserService
  ) {}

  ngOnInit() {
    forkJoin({
      history: this.approvalService.getHistory(),
      requests: this.accessService.getAllRequests(),
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ history, requests, users }) => {
        const requestMap: Record<number, OutingRequest> = Object.fromEntries(requests.map(r => [r.id, r]));
        const userMap: Partial<Record<number, User>> = Object.fromEntries(users.map(u => [u.id, u]));
        this.rows = [...history]
          .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
          .map(approval => {
            const request = requestMap[approval.requestId];
            return {
              approval,
              request,
              requesterName: request ? (userMap[request.userId]?.username || `User #${request.userId}`) : 'Unknown',
              adminName: userMap[approval.adminId]?.username || `Admin #${approval.adminId}`
            };
          });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }
}
