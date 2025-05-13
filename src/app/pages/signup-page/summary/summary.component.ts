import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.css'
})
export class SummaryComponent {
  constructor(public authService: AuthService, private router: Router) {}

  Confirm() {
    console.log("Signup Data:", this.authService.accountDetails); // Debug the accountDetails object

    const signupData = {
      firstName: this.authService.personalDetails?.firstName,
      lastName: this.authService.personalDetails?.lastName,
      matricule: this.authService.personalDetails?.matricule,
      nid: this.authService.personalDetails?.nid,
      username: this.authService.accountDetails?.username,
      password: this.authService.accountDetails?.password,
      role: this.authService.accountDetails?.role,
      factorySite: this.authService.workInformation?.factorySite,
      segment: this.authService.workInformation?.segment,
      email: this.authService.personalDetails?.email
    };

    console.log("Signup Payload:", signupData);

  // Validate required fields
  if (!signupData.firstName || !signupData.lastName || !signupData.role || !signupData.username || !signupData.password) {
    alert("Please complete all required fields.");
    return;
  }
    this.authService.signup(signupData).subscribe({
      next: () => {
        alert('Signup successful!');
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
      }
    });
  }
}