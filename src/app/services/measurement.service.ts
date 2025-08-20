import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Measurement } from '../models/measurement.model';

@Injectable({
  providedIn: 'root'
})
export class MeasurementService {

  private baseUrl = 'http://localhost:8084/api/measurements';  // New base for MeasurementController

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Change operatorMat to userMat here
saveMeasurement(payload: {
  testId: number,
  values: number[],
  operatorMat?: string | null,
  qmMat?: string | null,
  columnIndex?: number,
  mean?: number,
  range?: number
}): Observable<any> {
  return this.http.post(`${this.baseUrl}/save`, payload, {
    headers: this.getAuthHeaders(),
    responseType: 'text' as 'json'
  });
}


  getAllMeasurementsByTestId(testId: number): Observable<Measurement[]> {
    return this.http.get<Measurement[]>(`${this.baseUrl}/by-test-id/${testId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Change operatorMat to userMat here as well
  getMeasurementsByTestIdAndOperator(testId: number, userMat: string): Observable<Measurement[]> {
    return this.http.get<Measurement[]>(
      `${this.baseUrl}/by-test-id/${testId}/operator/${userMat}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // Delete measurement by ID
  deleteMeasurement(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
   hideColumn(
    testId: number,
    columnIndex: number,
    reason: string,
    hiddenBy: string
  ): Observable<any> {
    const payload = {
      testId,
      columnIndex,
      reason,
      hiddenBy
    };

    return this.http.post(`${this.baseUrl}/hidden-columns`, payload, {
      headers: this.getAuthHeaders()
    });
  }
  unhideColumn(testId: number, columnIndex: number, unhiddenBy: string): Observable<any> {
  const payload = { testId, columnIndex, unhiddenBy };
  return this.http.post(`${this.baseUrl}/unhide-column`, payload, {
    headers: this.getAuthHeaders()
  });
}
}

