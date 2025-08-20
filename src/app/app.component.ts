import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  showNavbar: boolean = false;

  constructor(private router: Router) {
 
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const operatorRoutes = ['/dashboard', '/launch-test', '/test-history', '/profile'];
        const adminRoutes = ['/admin/admindashboard', '/admin/AddUsers', '/admin/historique', '/admin/profile'];
        this.showNavbar = operatorRoutes.includes(event.urlAfterRedirects) || adminRoutes.some(route => event.urlAfterRedirects.startsWith(route));
      }
    });
  }

  title = 'my-frontend-app';
}