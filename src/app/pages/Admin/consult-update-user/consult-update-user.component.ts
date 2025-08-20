import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import * as XLSX from 'xlsx';
import { PageEvent } from '@angular/material/paginator';
import { Observable} from 'rxjs';

@Component({
  selector: 'app-consult-update-user',
  templateUrl: './consult-update-user.component.html',
  styleUrls: ['./consult-update-user.component.css'],
  standalone: false,
})
export class ConsultUpdateUserComponent implements OnInit {
  groupedUsers: { [role: string]: any[] } = {};
  selectedRole: string | null = null;
  pagedUsers: any[] = [];
filteredUsers: any[] = []; // ✅ after filtering
searchTerm: string = "";   // ✅ current search term
  // Pagination
  pageIndex: number = 0;
  pageSize: number = 5;

  constructor(private adminService: AdminService) {}
  ngOnInit(): void {
    this.adminService.getUsersGroupedByRole().subscribe({
      next: (data) => {
        this.groupedUsers = data;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      },
    });
  }
 selectRole(role: string) {
  this.selectedRole = this.selectedRole === role ? null : role;
  this.pageIndex = 0;
  if (this.selectedRole) {
    this.filteredUsers = [...this.groupedUsers[this.selectedRole]]; // reset filter
  }
  this.updatePagedUsers();
}
  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedUsers();
  }
applyUserFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.searchTerm = value;

  if (!this.selectedRole) return;

  const allUsers = this.groupedUsers[this.selectedRole] || [];

  switch (this.selectedRole) {
    case 'OPERATEUR':
      this.filteredUsers = allUsers.filter(u =>
        u.opMat?.toLowerCase().includes(value)
      );
      break;
    case 'QM':
      this.filteredUsers = allUsers.filter(u =>
        u.qmMat?.toLowerCase().includes(value)
      );
      break;
    case 'ADMIN':
      this.filteredUsers = allUsers.filter(u =>
        u.userNumber?.toString().toLowerCase().includes(value)
      );
      break;
    default:
      this.filteredUsers = allUsers;
  }

  this.pageIndex = 0; // reset pagination
  this.updatePagedUsers();
}

updatePagedUsers() {
  if (!this.selectedRole) return;
  const users = this.filteredUsers.length
    ? this.filteredUsers
    : this.groupedUsers[this.selectedRole] || [];
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  this.pagedUsers = users.slice(start, end);
}
  exportAllUsersByRoleToExcel(): void {
    if (!this.selectedRole || !this.groupedUsers[this.selectedRole]) return;
    const fileName = `${this.selectedRole}_Users.xlsx`;
    this.exportToExcel(this.groupedUsers[this.selectedRole], fileName, this.selectedRole);
  }
  private exportToExcel(data: any[], fileName: string, role: string | null): void {
    if (data.length === 0) return;
    let headers: string[] = [];
    let wsData: any[] = [];
    if (role === 'OPERATEUR') {
      headers = ['First Name', 'Last Name', 'Username', 'Matricule', 'Group', 'Segment Name', 'Segment Code'];
      wsData = data.map(user => [user.firstName, user.lastName, user.username, user.opMat, user.groupe, user.segment, user.factory]);
    } else if (role === 'ADMIN') {
      headers = ['First Name', 'Last Name', 'Username', 'Email', 'Admin Level'];
      wsData = data.map(user => [user.firstName, user.lastName, user.username, user.email, user.adminLevel]);
    } else if (role === 'QM') {
      headers = ['First Name', 'Last Name', 'Username', 'Matricule', 'Segment Name', 'Segment Code'];
      wsData = data.map(user => [user.firstName, user.lastName, user.username, user.qmMat, user.segment, user.factory]);
    } else {
      headers = Object.keys(data[0]);
      wsData = data.map(user => Object.values(user));
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([headers, ...wsData]);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, fileName);
  }
toggleUserStatus(user: any): void {
  const action = user.active ? 'deactivate' : 'activate';
  if (!confirm(`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`)) return;

  let identifier: string = '';
  switch (this.selectedRole) {
    case 'OPERATEUR': identifier = user.opMat; break;
    case 'ADMIN': identifier = user.email; break;
    case 'QM': identifier = user.qmMat; break;
    default: return;
  }
  // Toggle active status
  const newStatus = !user.active;
  this.adminService.toggleUserStatus(this.selectedRole!, identifier, newStatus).subscribe({
    next: () => {
      user.active = newStatus; // update UI after successful backend call
    },
    error: (err) => {
      console.error(`Failed to ${action} user:`, err);
      alert(`Error trying to ${action} user.`);
    }
  });
}
togglePassword(user: any): void {
  if (!user.showPassword) {
    const confirmed = confirm(`Show password for ${user.firstName} ${user.lastName}?`);
    if (!confirmed) return;

    let request: Observable<{ password: string }>; // ✅ Declare once

 if (user.role === 'OPERATEUR') {
  request = this.adminService.getGeneratedPassword(user.opMat);
} else if (user.role === 'QM') {
  request = this.adminService.getQmPassword(user.qmMat);
} else if (user.role === 'ADMIN') {
  const email = user.email;
  const plantSiteName = user.plantSiteName; // ✅ Use real plant name

  if (email && plantSiteName) {
    const prefix = email.split('@')[0];
    const safePrefix = prefix.length >= 5 ? prefix.substring(0, 5) : prefix;
    user.password = safePrefix + plantSiteName; // ✅ Real password
    user.showPassword = true;
    return;
  } else {
    alert('Email or plant site missing for admin.');
    return;
  }
} else {
  alert('Password not available for this role: ' + user.role);
  return;
}

    // ✅ Safe to use here — only reached if `request` was assigned
    request.subscribe({
      next: (res: { password: string }) => {
        user.password = res.password;
        user.showPassword = true;
      },
      error: (err) => {
        if (err.status === 404) {
          alert('❌ User not found in the system.');
        } else {
          alert('Failed to load password. Please try again.');
        }
        console.error(err);
      }
    });
  } else {
    user.showPassword = false;
  }
}
}
