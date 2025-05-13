import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  personalDetails: any = {};
  accountDetails: any = {};
  workInformation: any = {};

  private baseUrl = 'http://localhost:8084/api/auth'; // Adjust if needed

  constructor(private http: HttpClient) {}

  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, data,) 
      
    };
    login(credentials: any): Observable<any> {
      return this.http.post(`${this.baseUrl}/login`, credentials);
    }
    getCurrentUser() {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    }
    updatePersonalDetails(details: any) {
      this.personalDetails = details;
      console.log("Updated personalDetails:", this.personalDetails);
    }
    
    updateAccountDetails(details: any) {
      this.accountDetails = details;
      console.log("Updated accountDetails:", this.accountDetails);
    }
    
    updateWorkInformation(details: any) {
      this.workInformation = details;
      console.log("Updated workInformation:", this.workInformation);
    }
}
