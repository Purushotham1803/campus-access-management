import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';

const MAX_RETRIES = 4;
const RETRY_SECONDS = 10;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnDestroy {
  username = '';
  password = '';
  loading = false;
  error = '';
  hidePassword = true;
  retrying = false;
  retryCountdown = 0;
  private retryAttempt = 0;
  private retryTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnDestroy() { this.clearRetryTimer(); }

  login(isRetry = false) {
    if (!isRetry) {
      if (!this.username || !this.password) { this.error = 'Please enter credentials.'; return; }
      this.retryAttempt = 0;
    }
    this.clearRetryTimer();
    this.loading = true;
    this.error = '';
    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        const role = this.auth.getRole();
        if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else this.router.navigate(['/student/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        const isColdStart = err.status === 0 || [502, 503, 504].includes(err.status);
        if (err.status === 401) {
          this.error = 'Invalid username or password.';
        } else if (isColdStart && this.retryAttempt < MAX_RETRIES) {
          this.retryAttempt++;
          this.error = `Free hosting sleeps when idle — waking the server up (attempt ${this.retryAttempt}/${MAX_RETRIES})...`;
          this.startRetryCountdown();
        } else if (isColdStart) {
          this.error = 'The server is taking longer than usual to start. Please wait a moment and click Sign In again.';
        } else {
          this.error = 'Something went wrong logging in. Please try again.';
        }
      }
    });
  }

  private startRetryCountdown() {
    this.retrying = true;
    this.retryCountdown = RETRY_SECONDS;
    this.retryTimer = setInterval(() => {
      this.retryCountdown--;
      if (this.retryCountdown <= 0) {
        this.clearRetryTimer();
        this.login(true);
      }
    }, 1000);
  }

  private clearRetryTimer() {
    if (this.retryTimer) { clearInterval(this.retryTimer); this.retryTimer = null; }
    this.retrying = false;
  }
}
