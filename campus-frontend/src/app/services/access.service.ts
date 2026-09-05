import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccessPass, GateEntry, OutingRequest } from '../models/models';

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
