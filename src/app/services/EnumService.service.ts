import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnumService {
  constructor(private http: HttpClient) {}

getGroupes(): Observable<{ [key: string]: string }> {
  return this.http.get<{ [key: string]: string }>('http://localhost:8084/api/enums/groupe');
}
}