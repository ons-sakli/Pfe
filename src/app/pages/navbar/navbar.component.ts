import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: false
})
export class NavbarComponent implements OnInit {
  userInitials: string = '';
  currentUserRole: string | null = null;
    isProfileActive = false;

  get isAdmin(): boolean {
    return this.roleService.isAdmin;
  }

  get isOperator(): boolean {
    return this.roleService.isOperator;

  }
  get isQualityManager(): boolean {
  return this.roleService.isQualityManager;
}
  constructor(
    private http: HttpClient,
    public router: Router,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService
  ) {}
isExactRoute(route: string): boolean {
  return this.router.url === route;
}
isSubRouteActive(): boolean {
  return this.isExactRoute('/admin/AddUsers') || this.isExactRoute('/admin/ManageMachines');
}

  ngOnInit(): void {
   this.fetchUserProfile();
   // Listen for route changes to update isProfileActive
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
        this.isProfileActive = event.urlAfterRedirects === '/profile'|| event.urlAfterRedirects === '/admin/profile';
        this.cdr.detectChanges(); // Ensure the view updates
      });

}
  fetchUserProfile(): void {
    const token = localStorage.getItem('authToken');
    const opMatOrEmail = localStorage.getItem('identifier');

    if (!token || !opMatOrEmail) {
      this.userInitials = '*?';
      return;
    }

    this.http.get(`http://localhost:8084/api/users/${opMatOrEmail}`).subscribe({
      next: (response: any) => {
        console.log('Navbar Profile Response:', response);

        const firstName = response.firstName || '';
        const lastName = response.lastName || '';
        const role = (response.role || '').toLowerCase();

        this.userInitials = this.getInitials(firstName, lastName);
        this.currentUserRole = role;

       

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching profile in navbar:', err);
        this.userInitials = '*?';
      }
    });
  }

  getInitials(firstName: string, lastName: string): string {
    const firstInitial = firstName.charAt(0)?.toUpperCase() || '?';
    const lastInitial = lastName.charAt(0)?.toUpperCase() || '?';
    return `${firstInitial}${lastInitial}`;
  }

goToProfile(): void {
  if (this.roleService.isAdmin) {
    this.router.navigate(['/admin/profile']);
  } else if (this.roleService.isOperator) {
    this.router.navigate(['/profile']);
  } else {
    alert('You must be logged in to view your profile.');
  }
}
// Safer: Clear all relevant keys without relying on instance vars
logout(): void {
  Object.keys(localStorage).forEach(key => {
    if (
      key.includes('auth') ||
      key.includes('identifier') ||
      key.includes('role') ||
      key.includes('user') ||
      key.includes('measurement_data') ||
      key.includes('saved_')
    ) {
      localStorage.removeItem(key);
    }
  });

  this.router.navigate(['/']);
}

}
