import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Approval, OutingRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApprovalService {
  private apiUrl = `${environment.apiBaseUrl}/approvals`;
  constructor(private http: HttpClient) {}

  getPending(): Observable<OutingRequest[]> {
    return this.http.get<OutingRequest[]>(`${this.apiUrl}/pending`);
  }
  getHistory(): Observable<Approval[]> {
    return this.http.get<Approval[]>(`${this.apiUrl}/history`);
  }
  submitApproval(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
  getPendingReturns(): Observable<OutingRequest[]> {
    return this.http.get<OutingRequest[]>(`${this.apiUrl}/pending-returns`);
  }
  approveReturn(requestId: number, approve: boolean): Observable<OutingRequest> {
    return this.http.post<OutingRequest>(`${this.apiUrl}/return`, { requestId, approve });
  }
}
