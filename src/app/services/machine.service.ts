import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Machine, Segment } from '../models/machine.model';

@Injectable({ providedIn: 'root' })
export class MachineService {
  private readonly baseUrl = 'http://localhost:8084/api/machines';

  constructor(private http: HttpClient) {}

  // GET all machines
  getAllMachines(): Observable<Machine[]> {
    return this.http.get<Machine[]>(`${this.baseUrl}/all`);
  }

  // POST new machine
addMachine(machineData: any): Observable<any> {
  const token = localStorage.getItem('authToken');
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });
  return this.http.post(this.baseUrl, machineData, { headers });
}

  // DELETE machine by nrMachine
  deleteMachine(nrMachine: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${nrMachine}`);
  }

  // GET all segments
  getAllSegments(): Observable<Segment[]> {
  // Use the correct backend endpoint for segments, not machines
  return this.http.get<Segment[]>('http://localhost:8084/api/segments/all');
}


  // GET distinct machine numbers
  getMachineNumbers(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/numbers`);
  }

  // GET distinct machine types
  getMachineTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/types`);
  }

  // GET distinct clients
  getClients(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/clients`);
  }

  // PUT update machine
  updateMachine(machine: Machine): Observable<Machine> {
    return this.http.put<Machine>(`${this.baseUrl}/update`, machine);
  }
  getPlantSites(): Observable<string[]> {
  return this.http.get<string[]>('http://localhost:8084/api/segments/plants');
}
// GET segments by plant site name
getSegmentsByPlantSite(plantSiteName: string): Observable<Segment[]> {
  return this.http.get<Segment[]>(
    'http://localhost:8084/api/segments/by-plant-site',
    { params: { plantSiteName } }
  );
}
toggleMachineStatus(nrMachine: string, active: boolean): Observable<any> {
  return this.http.patch(`${this.baseUrl}/${nrMachine}/status`, { active });
}

}