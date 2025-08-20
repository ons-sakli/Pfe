import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Machine } from '../models/machine.model';
import { WireSection } from '../models/wireSection.model';

// ✅ Remove duplicate interface — use one
interface PerformanceData {
  machineNumber: string;
  wireSection: string;
  xChart: {
    labels: string[];
    values: number[];
    limit: number;
  };
  rChart: {
    labels: string[];
    values: number[];
    limit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DashboardServiceService {

  private baseUrl = 'http://localhost:8084/api/admins'; // ✅ Fixed: was /admins

  constructor(private http: HttpClient) {}

 getUserCounts(): Observable<{ operators: number; qms: number; admins: number }> {
  return this.http.get<{ operators: number; qms: number; admins: number }>(
    'http://localhost:8084/api/users/count-by-role'
  );
}

  getTotalTests(): Observable<number> {
    return this.http.get<number>('http://localhost:8084/api/tests/count');
  }

  getTotalSegments(): Observable<number> {
    return this.http.get<number>('http://localhost:8084/api/segments/count');
  }

  getTotalMachines(): Observable<number> {
    return this.http.get<number>('http://localhost:8084/api/machines/count');
  }

  getPassingTests(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8084/api/tests/passing');
  }

  /**
   * Fetch 5-day performance data for X̄ and R charts
   * @param from Start date (Date object)
   * @param to End date (Date object)
   * @returns List of PerformanceData (one per machine)
   */
getAllMachines(): Observable<Machine[]> {
  return this.http.get<Machine[]>('http://localhost:8084/api/machines/all');
}

getAllWireSections(): Observable<WireSection[]> {
  return this.http.get<WireSection[]>('http://localhost:8084/api/wire-sections/all');
}

getPerformanceByMachineAndSection(
  machine: string,
  section: string,
  from: Date,
  to: Date
): Observable<PerformanceData> {
  const params = new HttpParams()
    .set('machine', machine)
    .set('section', section)
    .set('from', from.toISOString().split('T')[0])
    .set('to', to.toISOString().split('T')[0]);

  return this.http.get<PerformanceData>('http://localhost:8084/api/admins/performance', { params });
}
getMachinePerformanceSummary(): Observable<any> {
  return this.http.get<any>('http://localhost:8084/api/admins/machine-performance-summary');
}
}