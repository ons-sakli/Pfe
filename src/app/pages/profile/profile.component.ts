import { Component ,OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { UpdateProfileDialogComponent } from '../update-profile-dialog/update-profile-dialog.component';
import { catchError, of } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: any = {}; // Object to hold user data
  userInitials: string = '';
  editableUser: any = {}; // Temporary object for editing
  isUpdateFormOpen: boolean = false; // Controls modal visibility
  showPassword = false;
  eyeIcon: any;
  eyeOffIcon: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer // Inject DomSanitizer

  )  {
    // Sanitize the SVGs
    this.eyeIcon = this.sanitizer.bypassSecurityTrustHtml(`
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" fill="none"/>
    `);

    this.eyeOffIcon = this.sanitizer.bypassSecurityTrustHtml(`
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor"/>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" fill="none"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" fill="none"/>
      <path d="M6.61 6.61A13.16 13.16 0 0 0 5 8c0 7 7 10 7 10a10.43 10.43 0 0 0 2.68-1.67" stroke="currentColor" fill="none"/>
      <path d="M8 14a6 6 0 0 0 8 0" stroke="currentColor" fill="none"/>
    `);
  }
  ngOnInit(): void {
    this.fetchUserProfile();
  }

  // profile.component.ts
fetchUserProfile(): void {
  const token = localStorage.getItem('authToken');
  const opMatOrEmail = localStorage.getItem('identifier');

  if (!token || !opMatOrEmail) {
    this.userInitials = '*?';
    return;
  }

  this.http.get(`http://localhost:8084/api/users/${opMatOrEmail}`).subscribe({
    next: (response: any) => {
      console.log('Admin Profile Response:', response);

      // ✅ Extract flat values for UI
      this.user = {
        username: response.username,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        role: response.role,
        segment: response.segment?.segmentName || 'N/A', // ✅ Extract segmentName
        plant: response.segment?.plant?.plantSiteName || 'N/A' // ✅ Extract plantSiteName
      };

      this.userInitials = this.getUserInitials(response.firstName, response.lastName);
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error fetching profile:', err);
      this.userInitials = '*?';
    }
  });
}
  getUserInitials(firstName?: string, lastName?: string): string {
    const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  
openUpdateForm(): void {
  const dialogRef = this.dialog.open(UpdateProfileDialogComponent, {
    width: '400px',
    data: {
      username: this.user.username,
      email: this.user.email,
      plant: this.user.plant
    }
  });

  dialogRef.afterClosed().subscribe((updatedData) => {
    if (updatedData) {
      // ✅ Update displayed user
      this.user.email = updatedData.email;
      this.user.plant = updatedData.plant;

      // ✅ Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.email = updatedData.email;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));

      // ✅ Update identifier (used for future API calls)
      localStorage.setItem('identifier', updatedData.email);

      // ✅ Optional: Show success toast
      alert('Profile updated successfully');
    }
  });
}
logout(): void {
  // Clear session
  localStorage.removeItem('authToken');
  localStorage.removeItem('identifier');
  localStorage.removeItem('role');
  localStorage.removeItem('currentUser');

  // Redirect to login
  this.router.navigate(['/']);
}
togglePassword(): void {
  if (this.showPassword) {
    this.showPassword = false;
    this.user.password = "******";
    return;
  }

  // ✅ Only Admin: use /api/admins/my-password
  this.http.get<{ password: string }>('http://localhost:8084/api/admins/my-password')
    .subscribe({
      next: (res) => {
        this.user.password = res.password;
        this.showPassword = true;
      },
      error: (err) => {
        console.error('Failed to load admin password', err);
        alert('Could not retrieve password.');
        this.user.password = "******";
      }
    });
}
}