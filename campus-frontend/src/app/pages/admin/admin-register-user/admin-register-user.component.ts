import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/models';

@Component({
  selector: 'app-admin-register-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './admin-register-user.component.html',
  styleUrls: ['./admin-register-user.component.scss']
})
export class AdminRegisterUserComponent {
  submitting = false;
  errorMsg = '';
  lastCreated: User | null = null;

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['STUDENT', Validators.required],
    department: [''],
    year: [null as number | null],
  });

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  get role() { return this.form.value.role; }
  get needsDepartment() { return this.role === 'STUDENT' || this.role === 'FACULTY'; }
  get needsYear() { return this.role === 'STUDENT'; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.errorMsg = '';
    this.lastCreated = null;
    this.submitting = true;

    const payload = {
      username: this.form.value.username,
      password: this.form.value.password,
      role: this.form.value.role,
      department: this.needsDepartment ? this.form.value.department : null,
      year: this.needsYear ? this.form.value.year : null,
    };

    this.userService.registerUser(payload).subscribe({
      next: (user) => {
        this.submitting = false;
        this.lastCreated = user;
        this.snackBar.open(`Account created for "${user.username}".`, 'OK', { duration: 3000 });
        this.form.reset({ username: '', password: '', role: 'STUDENT', department: '', year: null });
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Could not create the account. Please try again.';
      }
    });
  }
}
