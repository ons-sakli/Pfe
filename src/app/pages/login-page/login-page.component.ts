import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  standalone: false
})
export class LoginPageComponent {
  identifier: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private route: ActivatedRoute
  ) { }

  onLogin(): void {
    const trimmed = this.identifier.trim();

    if (!trimmed || !this.password) {
      alert('Please enter identifier and password');
      return;
    }

    // Detect type
    const isEmail = trimmed.includes('@');
    const isQmMat = /^QM\d+$/i.test(trimmed) || /^\d{4,6}$/.test(trimmed); // e.g., 010203 or QM123456
    const isOpMat = /^\d{10}$/.test(trimmed); // e.g., 9876543210

    // Only one field will be set
    const loginRequest = {
      opMat: isOpMat ? trimmed : null,
      qmMat: isQmMat && !isOpMat ? trimmed : null,
      email: isEmail ? trimmed : null,
      password: this.password,
    };

    console.log('Sending login request:', loginRequest);

    this.http.post<{
      token: string;
      firstName: string;
      lastName: string;
      role: string;
      opMat?: string;
      qmMat?: string;
      email?: string;
    }>(
      'http://localhost:8084/api/auth/login',
      loginRequest,
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe({
      next: (res) => {
        const { token, firstName, lastName, role, opMat, qmMat, email } = res;

        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('identifier', opMat || qmMat || email || '');
        localStorage.setItem('role', role.toLowerCase());
        localStorage.setItem('currentUser', JSON.stringify({
          firstName, lastName, role, opMat, qmMat, email
        }));

        // Redirect
        const userRole = role.toLowerCase();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

        if (userRole === 'admin') {
          this.router.navigate([returnUrl || '/admin/admindashboard']);
        } else if (userRole === 'operateur') {
          this.router.navigate([returnUrl || '/launch-test']);
        } else if (userRole === 'qm') {
          this.router.navigate([returnUrl || '/admin/admindashboard']);
        } else {
          alert(`Unknown role: ${role}`);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        const errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
        alert(errorMessage);
      }
    });
  }
}