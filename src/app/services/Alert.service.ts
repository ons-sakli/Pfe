import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

// alert.service.ts
@Injectable({ providedIn: 'root' })
export class AlertService {
  constructor(private http: HttpClient) {}

  sendTestFailureAlert(alertData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post('http://localhost:8084/api/alerts/test-failure', alertData, { headers });
  }
}