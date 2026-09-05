import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiBaseUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(req: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, req).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        const payload = this.decodeToken(res.token);
        localStorage.setItem('role', payload.role);
        localStorage.setItem('userId', payload.userId);
        localStorage.setItem('username', payload.sub);
      })
    );
  }

  logout() { localStorage.clear(); this.router.navigate(['/login']); }
  getToken() { return localStorage.getItem('token'); }
  getRole() { return localStorage.getItem('role'); }
  getUserId() { return parseInt(localStorage.getItem('userId') || '0'); }
  getUsername() { return localStorage.getItem('username'); }
  isLoggedIn() { return !!this.getToken(); }

  decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch { return {}; }
  }
}
