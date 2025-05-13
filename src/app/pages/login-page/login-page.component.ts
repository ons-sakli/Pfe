import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: false,
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  matricule: string = ''; // Use "matricule" instead of "username"
  password: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  onLogin(): void {
    // Create the login request payload
    const loginRequest = {
      opMat: this.matricule.trim(), // Trim whitespace from input
      password: this.password
    
    };

    // Log the request payload for debugging purposes
    console.log('Sending login request:', loginRequest);

    // Send a POST request to the backend for authentication
    this.http.post<{ token: string; username: string; role: string; matricule: string; firstname:string;lastname:string }>(      'http://localhost:8084/api/auth/login',
      loginRequest,
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: (response) => {
        const { token, username, role, matricule , firstname, lastname } = response;
        // Store the JWT token in localStorage
        localStorage.setItem('authToken', token);
        // Store user details in localStorage for easy access
        localStorage.setItem('currentUser', JSON.stringify({ username, role, matricule , firstname, lastname }));
        // Log the successful login for debugging
        console.log('Login successful. Username:', username, 'Role:', role);
        // Navigate based on the user's role
        switch (role) {
          case 'OPERATEUR':
            this.router.navigate(['/launch-test']);
            break;
          case 'ADMIN':
            this.router.navigate(['/dashboard']);
            break;
          default:
            alert(`Unknown role: ${role}`);
            console.warn(`Unknown role encountered: ${role}`);
        }
      },
      error: (err) => {
        // Log the error for debugging
        console.error('Login failed:', err);

        // Display a user-friendly error message
        const errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
        alert(errorMessage);
      }
    });
  }
}