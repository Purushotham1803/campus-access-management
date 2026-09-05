
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/users`;
  constructor(private http: HttpClient) {}
  getUsers(): Observable<User[]> { return this.http.get<User[]>(this.apiUrl); }
  getUserProfile(id: number): Observable<User> { return this.http.get<User>(`${this.apiUrl}/${id}/profile`); }
  registerUser(data: any): Observable<User> { return this.http.post<User>(this.apiUrl, data); }
}
