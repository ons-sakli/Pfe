import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly ROLE_KEY = 'role';

  setRole(role: string): void {
    localStorage.setItem(this.ROLE_KEY, role);
  }

  get role(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  get isAdmin(): boolean {
    return this.role === 'admin';
  }

  get isOperator(): boolean {
    return this.role === 'operateur';
  }
  get isQualityManager(): boolean {
  const role = localStorage.getItem('role');
  return role === 'qm';
}

  clearRole(): void {
    localStorage.removeItem(this.ROLE_KEY);
  }
}
