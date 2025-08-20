import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WireSection } from '../models/wireSection.model';

@Injectable({
  providedIn: 'root'
})
export class WireSectionService {

  private apiUrl = 'http://localhost:8084/api/wire-sections';

  constructor(private http: HttpClient) {}

  getAllSections(): Observable<WireSection[]> {
    return this.http.get<WireSection[]>(`${this.apiUrl}/all`);
  }

getSectionBySectionName(section: string): Observable<WireSection> {
  return this.http.get<WireSection>(`${this.apiUrl}/${encodeURIComponent(section)}`);
}
  
}
