import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.css'
})
export class AddUsersComponent {


  
  selectedIndex = 0;
accountForm!: FormGroup;
personalForm!: FormGroup;
workForm!: FormGroup;

  constructor(public authService: AuthService, private fb: FormBuilder) {
    // Initialize with empty form groups
    this.accountForm = this.fb.group({});
    this.personalForm = this.fb.group({});
    this.workForm = this.fb.group({});
  }

  handleAccountFormReady(form: FormGroup) {
    this.accountForm = form;
  }
  handlePersonalFormReady(form: FormGroup) {
    this.personalForm = form;
  }
  handleWorkFormReady(form: FormGroup) {
    this.workForm = form;
  }
handleStepChange(newIndex: number) {
  if (newIndex >= 0 && newIndex <= 3) {
    this.selectedIndex = newIndex;}}
  updatePersonalDetails(details: any) {
    this.authService.personalDetails = details;}
updateAccountDetails(details: any) {
  if (Array.isArray(details)) {
    // Excel import - handled in AuthService already
    console.log('Excel import detected');
  } else {
    this.authService.accountDetails = details;}}
  updateWorkInformation(details: any) {
    this.authService.workInformation = details;}
}