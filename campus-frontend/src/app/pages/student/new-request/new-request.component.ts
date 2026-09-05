import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccessService } from '../../../services/access.service';
import { AuthService } from '../../../services/auth.service';

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function combineDateAndTime(date: Date, timeOfDay: string): string {
  const [h, m] = timeOfDay.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(h, m, 0, 0);
  return `${combined.getFullYear()}-${pad(combined.getMonth() + 1)}-${pad(combined.getDate())}T${pad(combined.getHours())}:${pad(combined.getMinutes())}`;
}

@Component({
  selector: 'app-new-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatSnackBarModule],
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.scss']
})
export class NewRequestComponent {
  submitting = false;
  errorMsg = '';

  // Booking window: today through 3 months from today.
  readonly today = startOfDay(new Date());
  readonly maxBookingDate = (() => {
    const d = startOfDay(new Date());
    d.setMonth(d.getMonth() + 3);
    return d;
  })();

  form = this.fb.group({
    type: ['LOCAL', Validators.required],
    reason: ['', [Validators.required, Validators.minLength(3)]],
    destination: ['', Validators.required],
    departureDate: [this.today, Validators.required],
    departureTimeOfDay: ['09:00', Validators.required],
    returnDate: [this.today, Validators.required],
    returnTimeOfDay: ['17:00', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private accessService: AccessService,
    private auth: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.applyLocalLock('LOCAL');
    this.form.get('type')!.valueChanges.subscribe((type) => this.applyLocalLock(type!));
  }

  private applyLocalLock(type: string) {
    const dep = this.form.get('departureDate')!;
    const ret = this.form.get('returnDate')!;
    if (type === 'LOCAL') {
      // Local outings always depart and return today, before 9 PM — lock the date pickers.
      this.form.patchValue({ departureDate: this.today, returnDate: this.today });
      dep.disable({ emitEvent: false });
      ret.disable({ emitEvent: false });
      const depTime = this.form.value.departureTimeOfDay || '09:00';
      if (depTime >= '21:00') this.form.patchValue({ departureTimeOfDay: '18:00' });
      const retTime = this.form.value.returnTimeOfDay || '17:00';
      if (retTime > '21:00') this.form.patchValue({ returnTimeOfDay: '21:00' });
    } else {
      dep.enable({ emitEvent: false });
      ret.enable({ emitEvent: false });
    }
  }

  get isLocal() { return this.form.value.type === 'LOCAL'; }

  // For NON_LOCAL, any day today..+3 months is selectable. For LOCAL, the
  // calendar is locked to today only so the picker itself enforces the rule.
  get dateMin() { return this.today; }
  get dateMax() { return this.isLocal ? this.today : this.maxBookingDate; }

  get departureTimeMin() { return this.isLocal ? '05:00' : null; }
  get departureTimeMax() { return this.isLocal ? '20:59' : null; }
  get returnTimeMin() { return this.isLocal ? '05:00' : null; }
  get returnTimeMax() { return this.isLocal ? '21:00' : null; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.errorMsg = '';
    this.submitting = true;

    const v = this.form.getRawValue();
    const payload = {
      userId: this.auth.getUserId(),
      type: v.type,
      reason: v.reason,
      destination: v.destination,
      departureTime: combineDateAndTime(v.departureDate!, v.departureTimeOfDay!),
      returnTime: combineDateAndTime(v.returnDate!, v.returnTimeOfDay!),
    };

    this.accessService.createRequest(payload).subscribe({
      next: () => {
        this.submitting = false;
        this.snackBar.open('Outing request submitted — status: PENDING admin approval.', 'OK', { duration: 4000 });
        this.router.navigate(['/student/requests']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = typeof err?.error === 'string' ? err.error : 'Could not submit request. Please check the details and try again.';
      }
    });
  }
}
