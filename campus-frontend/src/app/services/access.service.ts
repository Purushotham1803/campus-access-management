import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OutingRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AccessService {
  private apiUrl = `${environment.apiBaseUrl}/access`;
  constructor(private http: HttpClient) {}

  createRequest(data: any): Observable<OutingRequest> {
    return this.http.post<OutingRequest>(`${this.apiUrl}/requests`, data);
  }
  getMyRequests(userId: number): Observable<OutingRequest[]> {
    return this.http.get<OutingRequest[]>(`${this.apiUrl}/requests/user/${userId}`);
  }
  getAllRequests(): Observable<OutingRequest[]> {
    return this.http.get<OutingRequest[]>(`${this.apiUrl}/requests`);
  }
  cancelRequest(id: number): Observable<OutingRequest> {
    return this.http.put<OutingRequest>(`${this.apiUrl}/requests/${id}/cancel`, {});
  }
  requestReturn(requestId: number, userId: number): Observable<OutingRequest> {
    return this.http.post<OutingRequest>(`${this.apiUrl}/requests/${requestId}/request-return`, { userId });
  }
}
