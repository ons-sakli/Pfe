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
        // Define routes where the navbar should be visible
        const operatorRoutes = ['/dashboard', '/launch-test', '/test-history', '/profile'];
        this.showNavbar = operatorRoutes.includes(event.urlAfterRedirects);
      }
    });
  }
  title = 'my-frontend-app';
}
