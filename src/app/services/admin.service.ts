import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8084/api/admins'; 

  constructor(private http: HttpClient) {}

  deleteUser(role: string, identifier: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/delete/${role}/${identifier}`, { headers });
  }
getUsersGroupedByRole(): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get('http://localhost:8084/api/users/grouped-by-role', { headers });
}
  getGeneratedPassword(opMat: string): Observable<{ password: string }> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<{ password: string }>(`${this.baseUrl}/operators/${opMat}/generated-password`, { headers });
  }
getQmPassword(qmMat: string): Observable<{ password: string }> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<{ password: string }>(`${this.baseUrl}/qms/${qmMat}/generated-password`, { headers });
}
toggleUserStatus(role: string, identifier: string, active: boolean) {
  const token = localStorage.getItem('token'); // your saved JWT
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.patch(
    `/api/admins/${role}/${identifier}/status`,
    { active },
    { headers }
  );
}


}
