import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-personal-details',
  standalone: false,
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {
  @Input() selectedIndex: number = 1;
  @Output() stepChange = new EventEmitter<number>();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formGroupReady = new EventEmitter<FormGroup>();
  personalForm!: FormGroup;

  constructor(public authService: AuthService, private fb: FormBuilder) {}

  ngOnInit() {
    const saved = this.authService.personalDetails || {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: ''
    };

    this.personalForm = this.fb.group({
      firstName: [saved.firstName],        // optional
      lastName: [saved.lastName],          // optional
      email: [saved.email],                // required only for QM
      phoneNumber: [saved.phoneNumber]     // optional
    });

    this.formGroupReady.emit(this.personalForm);
  }

  Goback() {
    this.stepChange.emit(0);
  }

  onSubmit() {
    const role = this.authService.accountDetails?.role;
    if (!role) {
      alert('User role is not defined. Please go back and select a role.');
      return;
    }

    // Only validate email if role is QM
    if (role === 'QM') {
      const emailControl = this.personalForm.get('email');
      if (!emailControl?.value || emailControl.invalid) {
        alert('Please enter a valid email for the Quality Manager.');
        emailControl?.markAsTouched();
        return;
      }
    }

    // Save and proceed
    const formValue = this.personalForm.value;
    this.authService.personalDetails = formValue;
    this.formSubmit.emit(formValue);
    this.stepChange.emit(2);
  }
}
