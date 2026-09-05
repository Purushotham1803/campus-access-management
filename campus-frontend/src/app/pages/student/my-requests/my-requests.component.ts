import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccessService } from '../../../services/access.service';
import { AuthService } from '../../../services/auth.service';
import { AccessPass, OutingRequest } from '../../../models/models';

type StatusFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss']
})
export class MyRequestsComponent implements OnInit {
  requests: OutingRequest[] = [];
  loading = true;
  filter: StatusFilter = 'ALL';
  filters: StatusFilter[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  expandedId: number | null = null;
  passCache: Record<number, AccessPass | 'loading' | 'none'> = {};

  constructor(private accessService: AccessService, private auth: AuthService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.accessService.getMyRequests(this.auth.getUserId()).subscribe({
      next: (data) => { this.requests = [...data].sort((a, b) => b.id - a.id); this.loading = false; },
      error: () => { this.loading = false; this.snackBar.open('Could not load your requests.', 'Dismiss', { duration: 3000 }); }
    });
  }

  get filteredRequests() {
    if (this.filter === 'ALL') return this.requests;
    return this.requests.filter(r => r.status === this.filter);
  }

  getStatusClass(status: string): string {
    return 'badge-' + status.toLowerCase();
  }

  cancel(req: OutingRequest) {
    if (!confirm(`Cancel your ${req.type} request to ${req.destination}?`)) return;
    this.accessService.cancelRequest(req.id).subscribe({
      next: () => { this.snackBar.open('Request cancelled.', 'OK', { duration: 2500 }); this.load(); },
      error: (err) => this.snackBar.open(err?.error || 'Could not cancel request.', 'Dismiss', { duration: 3000 })
    });
  }

  togglePass(req: OutingRequest) {
    if (this.expandedId === req.id) { this.expandedId = null; return; }
    this.expandedId = req.id;
    if (this.passCache[req.id]) return;
    this.passCache[req.id] = 'loading';
    this.accessService.getPassByRequest(req.id).subscribe({
      next: (pass) => this.passCache[req.id] = pass,
      error: () => this.passCache[req.id] = 'none'
    });
  }
}
