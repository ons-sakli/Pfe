import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  userInitials: string = ''; // To store the computed initials

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    const token = localStorage.getItem('authToken'); // Retrieve the JWT token
    if (!token) {
      this.userInitials = '*?'; // Default to fallback initials if no token
      return;
    }

    this.http.get('http://localhost:8084/api/users/op').subscribe({
      next: (response: any) => {
        console.log('Navbar Profile Response:', response);

        const firstName = response.firstName || '';
        const lastName = response.lastName || '';

        this.userInitials = this.getInitials(firstName, lastName);
      },
      error: (err) => {
        console.error('Error fetching profile in navbar:', err);
        this.userInitials = '*?'; // Default to fallback initials on error
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '?';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '?';
    return `${firstInitial}${lastInitial}`;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}