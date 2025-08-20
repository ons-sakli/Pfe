import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-work-information',
  standalone: false,
  templateUrl: './work-information.component.html',
  styleUrls: ['./work-information.component.css']
})
export class WorkInformationComponent implements OnInit {
  workInfoForm!: FormGroup;
  @Output() stepChange = new EventEmitter<number>();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formGroupReady = new EventEmitter<FormGroup>();
  constructor(private fb: FormBuilder, public authService: AuthService) {}
  ngOnInit(): void {
    // Get factorySite from accountDetails (Step 1)
    const accountDetails = this.authService.accountDetails || {};
    const savedWorkInfo = this.authService.workInformation || {};
    // Initialize form
    this.workInfoForm = this.fb.group({
      factorySite: [{ 
        value: savedWorkInfo.factorySite || accountDetails.factorySite || '', 
        disabled: true  // ✅ Prevent editing
      }, Validators.required],
      segment: [savedWorkInfo.segment || '', Validators.required]
    });
    // Emit for stepper coordination
    this.formGroupReady.emit(this.workInfoForm);
  }
onSubmit() {
  const controls = this.workInfoForm.controls;
  const missingFields: string[] = [];
  if (controls['segment'].invalid) {
    missingFields.push('Segment');}
  if (missingFields.length > 0) {
    alert(`Please complete the following field:\n- ${missingFields[0]}`);
    this.workInfoForm.markAllAsTouched();
    return;}
  // ✅ Save both factorySite and segment
  const formData = {
    factorySite: this.workInfoForm.get('factorySite')?.value,
    segment: this.workInfoForm.get('segment')?.value };
  this.authService.workInformation = formData;
  console.log('Updated workInformation:', formData);
  this.formSubmit.emit(formData);
  this.stepChange.emit(3);} // Go to Summary
  Goback() {
    this.stepChange.emit(1);
  }
}