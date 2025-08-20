import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError, timeout } from 'rxjs';
import { forkJoin } from 'rxjs'; // make sure forkJoin is imported
@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  @Output() stepChange = new EventEmitter<number>();
  showPassword = false;
  isConfirming = false;

  constructor(public authService: AuthService, private router: Router) {}

  goToStep(stepIndex: number) {
    this.stepChange.emit(stepIndex);
  }

  togglePassword() {
    if (!this.showPassword) {
      const confirmed = confirm('Show password?');
      if (!confirmed) return;
    }
    this.showPassword = !this.showPassword;
  }
Confirm() {
  if (this.isConfirming) return;
  this.isConfirming = true;

  const multipleUsers = this.authService.importedUsers?.length > 0;

  if (multipleUsers) {
    const allUsers = this.authService.importedUsers;
    let successCount = 0;
    let failCount = 0;

    const signupObservables = allUsers.map(userBlock => {
      const role = userBlock.user.role;
      const payload: any = {
        firstName: userBlock.personal.firstName,
        lastName: userBlock.personal.lastName,
        role,
        password: userBlock.user.password,
        phoneNumber: userBlock.personal.phoneNumber,
        factorySite: userBlock.work.factorySite,
        segment: userBlock.work.segment,
        groupeId: userBlock.work.groupeId,
      };

      if (role === 'ADMIN') {
        payload.userNumber = userBlock.user.username || '';
        payload.email = userBlock.personal.email || '';
      } else {
        if (role === 'OPERATEUR' || role === 'QM') {
          payload.opMat = userBlock.personal.matricule;
        }
        if (role === 'QM') {
          payload.qmMat = userBlock.personal.matricule;
          const email = userBlock.personal.email;
          if (!email || email.trim() === '') {
            alert(`Email is required for QM: ${userBlock.user.username || '(no username)'}`);
            failCount++;
            return throwError(() => new Error('Missing QM email'));
          }
          payload.email = email.trim();
        }
      }

      return this.authService.signup(payload).pipe(
        timeout(10000),
        catchError(error => {
          console.error('Signup error for user:', userBlock.user.username, error);
          failCount++;
          return throwError(() => error);
        })
      );
    });

    forkJoin(signupObservables).subscribe({
      next: () => {
        successCount = allUsers.length - failCount;
        alert(`${successCount} user(s) added successfully. ${failCount} failed.`);
        this.resetStepper();
      },
      error: () => {
        alert(`Signup finished with ${failCount} failure(s).`);
        this.isConfirming = false;
      }
    });

  } else {
    const role = this.authService.accountDetails?.role;
    const payload: any = {
      firstName: this.authService.personalDetails?.firstName,
      lastName: this.authService.personalDetails?.lastName,
      role,
      password: this.authService.accountDetails?.password,
      phoneNumber: this.authService.personalDetails?.phoneNumber,
      factorySite: this.authService.workInformation?.factorySite,
      segment: this.authService.workInformation?.segment,
      groupeId: this.authService.workInformation?.groupeId,
    };

    if (role === 'ADMIN') {
      payload.userNumber = this.authService.accountDetails?.username || '';
      payload.email = this.authService.accountDetails?.email || '';
    } else {
      if (role === 'OPERATEUR' || role === 'QM') {
        payload.opMat = this.authService.accountDetails?.matricule;
      }
      if (role === 'QM') {
        payload.qmMat = this.authService.accountDetails?.matricule;
        const email = this.authService.personalDetails?.email;
        if (!email || email.trim() === '') {
          alert('Email is required for QM.');
          this.isConfirming = false;
          return;
        }
        payload.email = email.trim();
      }
    }

    // ✅ Minimal required fields check
    if (!payload.role || !payload.password || !payload.segment) {
      alert("Please complete all required fields.");
      this.isConfirming = false;
      return;
    }

    console.log('Signup payload:', payload);

    this.authService.signup(payload).subscribe({
      next: () => {
        const roleLabel = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        alert(`You added a new ${roleLabel}`);
        this.resetStepper();
      },
      error: (error) => {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
        this.isConfirming = false;
      }
    });
  }
}

  // ✅ After Excel: Go to dashboard
  private finalizeExcelImport(success: number, fail: number) {
    alert(`${success} user(s) added successfully. ${fail} failed.`);
    this.router.navigate(['/admin/admindashboard']);
  }

  // ✅ After Manual: Reset form for next entry
  private resetStepper() {
    this.authService.accountDetails = null;
    this.authService.personalDetails = null;
    this.authService.workInformation = null;
    this.authService.importedUsers = [];
    this.isConfirming = false;
    this.stepChange.emit(0);
  }
}