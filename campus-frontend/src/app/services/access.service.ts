import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccessPass, GateEntry, OutingRequest, PendingReturn } from '../models/models';

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
  getPassByRequest(requestId: number): Observable<AccessPass> {
    return this.http.get<AccessPass>(`${this.apiUrl}/passes/request/${requestId}`);
  }
  getActivePass(userId: number): Observable<AccessPass> {
    return this.http.get<AccessPass>(`${this.apiUrl}/passes/active/${userId}`);
  }
  requestReturn(passId: number, userId: number): Observable<AccessPass> {
    return this.http.post<AccessPass>(`${this.apiUrl}/passes/${passId}/request-return`, { userId });
  }
  getPendingReturns(): Observable<PendingReturn[]> {
    return this.http.get<PendingReturn[]>(`${this.apiUrl}/passes/pending-returns`);
  }
  approveReturn(passId: number, approve: boolean): Observable<AccessPass> {
    return this.http.post<AccessPass>(`${this.apiUrl}/passes/${passId}/approve-return`, { approve });
  }
  getGateLogs(): Observable<GateEntry[]> {
    return this.http.get<GateEntry[]>(`${this.apiUrl}/gate/logs`);
  }
  scanPass(passCode: string, securityId: number, type: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/gate/scan?passCode=${encodeURIComponent(passCode)}&securityId=${securityId}&type=${type}`,
      {},
      { responseType: 'text' }
    );
  }
}
