import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  importedUsers: any[] = [];
  public personalDetails: any = {};
  public accountDetails: any = {};
  public workInformation: any = {};
  private baseUrl = 'http://localhost:8084/api/auth';
  constructor(private http: HttpClient) {}
  isLoggedIn(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 > Date.now();}
getUserRole(): string | null {
  const role = localStorage.getItem('role');
  console.log('Retrieved Role from LocalStorage:', role);
  return role;}
  logout(): void {
    localStorage.removeItem('authToken');
     localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('identifier');}
signup(data: any): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(`${this.baseUrl}/signup`, data, { headers });}
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials);}
  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;}
  updatePersonalDetails(details: any) {
  this.personalDetails = details;
  console.log("Updated personalDetails:", this.personalDetails);}
updateAccountDetails(details: any) {
  this.accountDetails = details;
  console.log("Updated accountDetails:", this.accountDetails);}
updateWorkInformation(details: any) {
  this.workInformation = details;
  console.log("Updated workInformation:", this.workInformation);}
getCurrentOperatorMat(): string | null {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return user.opMat || null;}
  getCurrentQmMat(): string | null {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return user.qmMat || null;}
    // ✅ Get current user's matricule (based on role)
getUserMat(): string {
  const user = this.getCurrentUser();
  if (!user) return '';

  // Try to get matricule directly
  if (user.matricule) return user.matricule;
  if (user.opMat && this.getUserRole()?.toLowerCase() === 'operateur') return user.opMat;
  if (user.qmMat && this.getUserRole()?.toLowerCase() === 'qm') return user.qmMat;

  // Fallback: use username/email if matricule not available
  return user.userNumber || user.email || '';
}
}