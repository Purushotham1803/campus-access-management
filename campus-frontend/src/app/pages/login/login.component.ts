import { Component } from '@angular/core';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  hidePassword = true;

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    if (!this.username || !this.password) { this.error = 'Please enter credentials.'; return; }
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
        if (err.status === 401) {
          this.error = 'Invalid username or password.';
        } else if (err.status === 0 || [502, 503, 504].includes(err.status)) {
          this.error = 'Server is starting up (free hosting sleeps when idle) — please try again in about 30 seconds.';
        } else {
          this.error = 'Something went wrong logging in. Please try again.';
        }
      }
    });
  }
}
