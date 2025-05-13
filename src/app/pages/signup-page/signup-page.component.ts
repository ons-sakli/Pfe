import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: false,
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.css'
})
export class SignupPageComponent {
  selectedIndex = 0;

  constructor(public authService: AuthService) {}

  handleStepChange(newIndex: number) {
    this.selectedIndex = newIndex;
  }

  updatePersonalDetails(details: any) {
    this.authService.personalDetails = details;
  }

  updateAccountDetails(details: any) {
    this.authService.accountDetails = details;
  }

  updateWorkInformation(details: any) {
    this.authService.workInformation = details;
  }
}