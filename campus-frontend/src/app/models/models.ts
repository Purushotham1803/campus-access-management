export interface LoginRequest { username: string; password: string; }
export interface LoginResponse { token: string; }
export interface User { id: number; username: string; role: string; campusStatus: string; department?: string | null; year?: number | null; }
export interface OutingRequest {
  id: number; userId: number; type: string; reason: string; destination: string;
  departureTime: string; returnTime: string; status: string;
  returnStatus?: string; returnRequestedAt?: string | null; actualReturnTime?: string | null;
}
export interface Approval { id?: number; requestId: number; adminId: number; status: string; reason: string; }
