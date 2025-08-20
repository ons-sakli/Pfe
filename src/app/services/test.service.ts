import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ✅ Move interface to top or into its own file
export interface TestDto {
  testId: number;
  dateTest: string | null; // Can be null
  result?: string;
  machineId: string;
  operatorMat: string | null; // Can be null
  wireSection: string;
  qmMat: string | null; // ✅ Fix: must allow null
  plantSiteName?: string;
  segmentName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private apiUrl = 'http://localhost:8084/api/tests';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No auth token found');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json' // ✅ Always include
    });
  }

  createOrGetTest(testDto: any): Observable<TestDto> {
    return this.http.post<TestDto>(`${this.apiUrl}/create`, testDto, {
      headers: this.getAuthHeaders()
    });
  }

  getLatestForPrefill(machineId: string, section: string): Observable<TestDto> {
    const params = new HttpParams()
      .set('machineId', machineId)
      .set('section', section);

    return this.http.get<TestDto>(`${this.apiUrl}/latest-for-prefill`, {
      params,
      headers: this.getAuthHeaders()
    });
  }

  countTests(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`, {
      headers: this.getAuthHeaders()
    });
  }

  getTestHistory(params: { dateTest?: string; machineId?: string; wireSection?: string }): Observable<TestDto[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key as keyof typeof params]) {
        httpParams = httpParams.set(key, params[key as keyof typeof params]!);
      }
    });

    return this.http.get<TestDto[]>(`${this.apiUrl}/history`, {
      params: httpParams,
      headers: this.getAuthHeaders()
    });
  }
}