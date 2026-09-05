import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AccessService } from '../../../services/access.service';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { GateEntry, User } from '../../../models/models';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatButtonToggleModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './security-dashboard.component.html',
  styleUrls: ['./security-dashboard.component.scss']
})
export class SecurityDashboardComponent implements OnInit {
  passCode = '';
  scanType: 'OUT' | 'IN' = 'OUT';
  scanning = false;
  resultMsg = '';
  resultOk = false;

  loading = true;
  logs: GateEntry[] = [];
  userMap: Partial<Record<number, User>> = {};
  studentsOutCount = 0;
  studentsInCount = 0;

  constructor(
    private accessService: AccessService,
    private userService: UserService,
    private auth: AuthService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    forkJoin({
      logs: this.accessService.getGateLogs(),
      users: this.userService.getUsers()
    }).subscribe({
      next: ({ logs, users }) => {
        this.logs = logs;
        this.userMap = Object.fromEntries(users.map(u => [u.id, u]));
        this.studentsOutCount = users.filter(u => u.campusStatus === 'OUT').length;
        this.studentsInCount = users.filter(u => u.campusStatus === 'IN').length;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  scan() {
    if (!this.passCode.trim()) return;
    this.scanning = true;
    this.resultMsg = '';
    this.accessService.scanPass(this.passCode.trim(), this.auth.getUserId(), this.scanType).subscribe({
      next: (msg) => {
        this.scanning = false;
        this.resultOk = true;
        this.resultMsg = msg;
        this.passCode = '';
        this.load();
      },
      error: (err) => {
        this.scanning = false;
        this.resultOk = false;
        this.resultMsg = err?.error || 'Scan failed. Please check the pass code.';
      }
    });
  }
}
