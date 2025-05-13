import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-account-details',
  standalone: false,
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.css'
})
export class AccountDetailsComponent {
  @Input() selectedIndex: number = 1;
  @Output() stepChange = new EventEmitter<number>();

  accountDetails = {
    username: '',
    role: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  Goback() {
    this.stepChange.emit(0);
  }

  onSubmit() {
    if (!this.accountDetails.role) {
      alert("Please select a role.");
      return;
    }
    this.authService.accountDetails = this.accountDetails; // Update the service
    console.log("Updated accountDetails:", this.authService.accountDetails);

    this.stepChange.emit(2);
  }
}