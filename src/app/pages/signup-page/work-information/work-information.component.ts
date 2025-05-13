import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-work-information',
  standalone: false,
  templateUrl: './work-information.component.html',
  styleUrl: './work-information.component.css'
})
export class WorkInformationComponent {
  workInfoForm: FormGroup;
  @Output() stepChange = new EventEmitter<number>();

  constructor(private fb: FormBuilder, public authService: AuthService) {
    this.workInfoForm = this.fb.group({
      factorySite: ['', Validators.required],
      segment: ['', Validators.required],
    });
  }

  onSubmit() {
    /*if (this.workInfoForm.valid) {*/
      console.log(this.workInfoForm.value); // You can check the values here
      this.authService.workInformation = this.workInfoForm.value;
      
      this.stepChange.emit(3);
   /* }*/
  }
  updateWorkInformation(details: any) {
    this.authService.workInformation = details;
    console.log("Updated workInformation:", this.authService.workInformation);
  }
  Goback() {
    this.stepChange.emit(1);

  }
}
