import { Component, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.css'],
  standalone:false,

})
export class DeleteUserComponent {
  role: string = '';
  matricule: string = '';

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  deleteUser() {
    const token = localStorage.getItem('authToken');
if (token) {
  console.log('Decoded JWT payload:', JSON.parse(atob(token.split('.')[1])));
}
    if (!this.role || !this.matricule) {
      this.snackBar.open('Please select a role and enter a matricule', 'Close', { duration: 3000 });
      return;
    }

    this.adminService.deleteUser(this.role, this.matricule).subscribe({
      next: () => {
        this.snackBar.open(`User (${this.role}) deleted successfully`, 'Close', { duration: 3000 });
        this.role = '';
        this.matricule = '';
      },
      error: (err) => {
        this.snackBar.open(`Error: ${err.error.message || 'Failed to delete user'}`, 'Close', { duration: 3000 });
      }
    });
  }
}
