import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { OutingRequest, User } from '../../../models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  requests: OutingRequest[] = [];
  users: User[] = [];
  userMap: Partial<Record<number, User>> = {};

  constructor(private accessService: AccessService, private userService: UserService) {}

  ngOnInit() {
    forkJoin({
      requests: this.accessService.getAllRequests(),
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ requests, users }) => {
        this.requests = requests;
        this.users = users;
        this.userMap = Object.fromEntries(users.map(u => [u.id, u]));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  get pending() { return this.requests.filter(r => r.status === 'PENDING').sort((a, b) => b.id - a.id); }
  get approvedCount() { return this.requests.filter(r => r.status === 'APPROVED').length; }
  get rejectedCount() { return this.requests.filter(r => r.status === 'REJECTED').length; }
  get totalCount() { return this.requests.length; }
  get studentsOut() { return this.users.filter(u => u.campusStatus === 'OUT'); }
  get pendingPreview() { return this.pending.slice(0, 5); }

  requesterName(userId: number): string {
    return this.userMap[userId]?.username || `User #${userId}`;
  }
}
