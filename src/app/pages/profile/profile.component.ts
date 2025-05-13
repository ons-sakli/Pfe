import { Component ,OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { UpdateProfileDialogComponent } from '../update-profile-dialog/update-profile-dialog.component';

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
  constructor(private http: HttpClient ,private router: Router ,private dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    const token = localStorage.getItem('authToken'); // Retrieve the JWT token
    if (!token) {
      alert('You are not logged in.');
      return;
    }
  
    this.http.get('http://localhost:8084/api/users/op').subscribe({
      next: (response: any) => {
        console.log('Profile Response:', response);
        this.user = response;
  
        // Generate initials only if firstName and lastName are present
        if (response.firstName && response.lastName) {
          this.userInitials = this.getUserInitials(response.firstName, response.lastName);
        } else {
          console.warn('First name or last name is missing in the profile response.');
          this.userInitials = ''; // Default to empty initials
        }
        if (!token) {
          alert('You are not logged in. Redirecting to login...');
          this.router.navigate(['/login']); // Redirect to the login page
          return;
        }
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
        const errorMessage = err.error?.message || 'An unknown error occurred.';
        alert(`Failed to load profile: ${errorMessage}`);
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
      opMat: this.user.opMat,
      segment: this.user.segment, // Ensure this value exists
      groupe: this.user.groupe    // Ensure this value exists
    }
  });

  dialogRef.afterClosed().subscribe((updatedUser) => {
    if (updatedUser) {
      this.user = updatedUser; // Update the displayed user data if changes were made
    }
  });
}}