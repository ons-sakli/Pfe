import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isAuthenticated = this.authService.isLoggedIn();
    if (!isAuthenticated) {
      console.warn('User is not authenticated. Redirecting to login.');
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false;}
    // ✅ Support both single role (string) and multiple roles (array)
    const allowedRoles = next.data['roles'] as string[] | undefined;
    const requiredRole = next.data['role'] as string | undefined;
    const userRole = this.authService.getUserRole()?.toLowerCase();
    // If no role is required, allow access
    if (!requiredRole && !allowedRoles) {
      return true; }
    // Build list of allowed roles
    let rolesToCheck: string[] = [];
    if (allowedRoles) {
      rolesToCheck = allowedRoles.map(r => r.toLowerCase());
    } else if (requiredRole) {
      rolesToCheck = [requiredRole.toLowerCase()];} // ✅ Only call on string
    // Check if user has any allowed role
    const hasAccess = userRole && rolesToCheck.includes(userRole);
    if (!hasAccess) {
      console.warn(`Access denied. User role: ${userRole}, Allowed: ${rolesToCheck}`);
      this.router.navigate(['/dashboard']);
      return false;}
    return true;}
}