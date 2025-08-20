import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-update-profile-dialog',
  templateUrl: './update-profile-dialog.component.html',
  styleUrls: ['./update-profile-dialog.component.css'],
  standalone: false
})
export class UpdateProfileDialogComponent implements OnInit {
  profileForm!: FormGroup;
  plants: any[] = [];
  showNewPasswordFields = false;

  // ✅ Declare 'data' as a class property
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    public dialogRef: MatDialogRef<UpdateProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // ✅ Fixed: named parameter with type
  ) {}

  ngOnInit(): void {
    // Load plants from backend
    this.http.get<any[]>('http://localhost:8084/api/plants').subscribe({
      next: (plants) => {
        this.plants = plants;
      },
      error: (err) => {
        console.error('Failed to load plants', err);
      }
    });

    // Initialize form
    this.profileForm = this.fb.group({
      username: [{ value: this.data.username, disabled: true }],
      email: [this.data.email || '', [Validators.required, Validators.email]],
      plant: [this.data.plant || '', Validators.required],
      currentPassword: ['', Validators.required],
      newPassword: [''],
      confirmPassword: ['']
    });
  }

  onCurrentPasswordInput(): void {
    const currentPass = this.profileForm.get('currentPassword')?.value;
    const isValid = currentPass && currentPass.trim().length > 0;

    if (isValid && !this.showNewPasswordFields) {
      this.showNewPasswordFields = true;

      this.profileForm.get('newPassword')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.profileForm.get('confirmPassword')?.setValidators([Validators.required]);

      this.updateFormValidity();
    } else if (!isValid) {
      this.showNewPasswordFields = false;
      this.profileForm.patchValue({ newPassword: '', confirmPassword: '' });
      this.clearPasswordValidators();
    }
  }

  private clearPasswordValidators(): void {
    this.profileForm.get('newPassword')?.clearValidators();
    this.profileForm.get('confirmPassword')?.clearValidators();
    this.updateFormValidity();
  }

  private updateFormValidity(): void {
    ['email', 'plant', 'currentPassword', 'newPassword', 'confirmPassword']
      .forEach(field => this.profileForm.get(field)?.updateValueAndValidity());
  }

  get passwordMismatch(): boolean {
    const newPassword = this.profileForm.get('newPassword')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;
    return this.showNewPasswordFields && newPassword && confirmPassword && newPassword !== confirmPassword;
  }

onSubmit(): void {
  const formValue = this.profileForm.value;

  // Case 1: Only changing password
  if (this.showNewPasswordFields) {
    if (!formValue.currentPassword) {
      alert('Current password is required');
      return;
    }
    if (this.passwordMismatch) {
      alert('New passwords do not match');
      return;
    }
    if (!formValue.newPassword || formValue.newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    // ✅ Send password change
    this.http.post('http://localhost:8084/api/admins/change-password', {
      currentPassword: formValue.currentPassword,
      newPassword: formValue.newPassword
    }).subscribe({
      next: (res: any) => {
        // ✅ Success: Show success and close
        console.log('Password changed successfully:', res);
        alert('Password changed successfully');
        this.dialogRef.close({
          email: this.data.email,  // No email change
          plant: this.data.plant   // No plant change
        });
      },
      error: (err) => {
        // ❌ Only show error if backend fails
        const msg = err.error?.message || err.message || 'Failed to change password';
        alert(msg);
      }
    });

    return;
  }

  // Case 2: Update profile (email, plant)
  const payload: any = {};

  if (formValue.email !== this.data.email) {
    if (this.profileForm.get('email')?.valid) {
      payload.email = formValue.email;
    } else {
      alert('Email is invalid');
      return;
    }
  }

  if (formValue.plant !== this.data.plant) {
    if (formValue.plant) {
      payload.plantSiteName = formValue.plant;
    } else {
      alert('Please select a valid plant');
      return;
    }
  }

  // If no changes, just close
  if (Object.keys(payload).length === 0) {
    this.dialogRef.close();
    return;
  }

 this.http.put('http://localhost:8084/api/admins/profile', payload).subscribe({
  next: (res: any) => {
    console.log('Profile updated:', res);

    // ✅ If new token is returned, update it
    if (res.token) {
      localStorage.setItem('authToken', res.token);
      localStorage.setItem('identifier', res.email);
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      currentUser.email = res.email;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    this.dialogRef.close({
      email: res.email,
      plant: res.plant
    });
  },
  error: (err) => {
    alert(err.error?.message || 'Failed to update profile');
  }
});}
  closeDialog(): void {
    this.dialogRef.close();
  }
}