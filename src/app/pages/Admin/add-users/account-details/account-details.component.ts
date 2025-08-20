import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.css'],
  standalone: false
})
export class AccountDetailsComponent implements OnInit {
  @Input() selectedIndex: number = 0;
  @Output() stepChange = new EventEmitter<number>();
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formGroupReady = new EventEmitter<FormGroup>();
  accountForm!: FormGroup;
  isImportedData: boolean = false;
  fileName: string = 'Choose excel file';

  constructor(private fb: FormBuilder, private authService: AuthService) {}

  ngOnInit(): void {
    const savedData = this.authService.accountDetails || {};
    this.isImportedData = savedData.username && !savedData.confirmPassword;

    this.accountForm = this.fb.group({
      username: [savedData.username || ''], // ✅ no default required validator
      role: [savedData.role || '', Validators.required],
      matricule: [savedData.matricule || ''],
      email: [savedData.email || ''],
      factorySite: [savedData.factorySite || '', Validators.required],
      password: [{ value: savedData.password || '', disabled: true }, Validators.required]
    });

    // Generate password initially
    this.generatePassword();

    // Role change: update validators and generate username for Admin
    this.accountForm.get('role')?.valueChanges.subscribe(() => this.updateValidatorsAndGeneratePassword());

    this.accountForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'ADMIN') {
        setTimeout(() => {
          const generatedUserNumber = this.generateUserNumber();
          this.accountForm.get('username')?.setValue(generatedUserNumber);
        });
      } else {
        this.accountForm.get('username')?.reset('');
      }
    });

    // Re-generate password when dependent fields change
    this.accountForm.get('matricule')?.valueChanges.subscribe(() => this.generatePassword());
    this.accountForm.get('email')?.valueChanges.subscribe(() => this.generatePassword());
    this.accountForm.get('factorySite')?.valueChanges.subscribe(() => this.generatePassword());

    this.formGroupReady.emit(this.accountForm);
  }

  private updateValidatorsAndGeneratePassword() {
    const role = this.accountForm.get('role')?.value;
    const matriculeControl = this.accountForm.get('matricule');
    const emailControl = this.accountForm.get('email');
    const usernameControl = this.accountForm.get('username');
    const factorySiteControl = this.accountForm.get('factorySite');

    // Reset validators
    matriculeControl?.clearValidators();
    emailControl?.clearValidators();
    usernameControl?.clearValidators();
    factorySiteControl?.clearValidators();

    if (role === 'OPERATEUR' || role === 'QM') {
      matriculeControl?.setValidators([Validators.required]);
      factorySiteControl?.setValidators([Validators.required]);
      // username & email optional
    }

    if (role === 'ADMIN') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      usernameControl?.setValidators([Validators.required]);
      factorySiteControl?.setValidators([Validators.required]);
    }

    matriculeControl?.updateValueAndValidity();
    emailControl?.updateValueAndValidity();
    usernameControl?.updateValueAndValidity();
    factorySiteControl?.updateValueAndValidity();

    this.generatePassword();
  }

  private generatePassword() {
    const role = this.accountForm.get('role')?.value;
    const matricule = this.accountForm.get('matricule')?.value;
    const email = this.accountForm.get('email')?.value;
    const factorySite = this.accountForm.get('factorySite')?.value;

    if (!factorySite) {
      this.accountForm.get('password')?.setValue('', { emitEvent: false });
      return;
    }

    let password = '';
    if ((role === 'OPERATEUR' || role === 'QM') && matricule) {
      const matriculeStr = String(matricule);
      if (matriculeStr.length >= 5) {
        password = matriculeStr.substring(0, 5) + factorySite;
      }
    } else if (role === 'ADMIN' && email) {
      const usernamePart = email.split('@')[0];
      const prefix = usernamePart.length >= 5 ? usernamePart.substring(0, 5) : usernamePart;
      password = prefix + factorySite;
    }

    this.accountForm.get('password')?.setValue(password, { emitEvent: false });
  }

  private generateUserNumber(): string {
    const upper = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const lower = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const number = Math.floor(1000 + Math.random() * 9000);
    return `${upper}${lower}${number}`;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.fileName = file.name;
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data: Uint8Array = new Uint8Array(e.target.result);
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });
      const worksheet: XLSX.WorkSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('The Excel file is empty.');
        return;
      }

      const validUsers: any[] = [];
      const errors: string[] = [];

      jsonData.forEach((row, index) => {
        const lineNumber = index + 2;
        const username = row['Username'];
        const role = row['Role'];
        const matricule = row['Matricule'];
        const firstName = row['First Name'];
        const lastName = row['Last Name'];
        const email = row['Email'];
        const factorySite = row['Factory Site'];
        const segment = row['Segment'];
        const rawPhoneNumber = row['PhoneNmbr'] || row['PhoneNumber'] || row['phone'];

        if (!role) {
          errors.push(`Row ${lineNumber}: Role is required.`);
          return;
        }

        let password: string;

        if (role === 'OPERATEUR' || role === 'QM') {
          if (!matricule) {
            errors.push(`Row ${lineNumber}: Matricule is required for ${role}.`);
            return;
          }
          if (!factorySite) {
            errors.push(`Row ${lineNumber}: Factory Site is required for ${role}.`);
            return;
          }
          const matriculeStr = String(matricule);
          if (matriculeStr.length < 5) {
            errors.push(`Row ${lineNumber}: Matricule must be at least 5 characters.`);
            return;
          }
          password = matriculeStr.substring(0, 5) + factorySite;
        } else if (role === 'ADMIN') {
          if (!username) {
            errors.push(`Row ${lineNumber}: Username is required for ADMIN.`);
            return;
          }
          if (!email) {
            errors.push(`Row ${lineNumber}: Email is required for ADMIN.`);
            return;
          }
          if (!factorySite) {
            errors.push(`Row ${lineNumber}: Factory Site is required for ADMIN.`);
            return;
          }
          const usernamePart = email.split('@')[0];
          const prefix = usernamePart.length >= 5 ? usernamePart.substring(0, 5) : usernamePart;
          password = prefix + factorySite;
        } else {
          errors.push(`Row ${lineNumber}: Invalid role '${role}'.`);
          return;
        }

        // phone number validation
        const phoneNumber = rawPhoneNumber ? String(rawPhoneNumber).trim() : '';
        const cleanedNumber = phoneNumber.replace(/\s+/g, '').replace(/^00/, '+');
        if (!cleanedNumber || !/^\+?[0-9]{8,15}$/.test(cleanedNumber)) {
          errors.push(`Row ${lineNumber}: A valid phone number is required.`);
          return;
        }

        const user = { username: username || '', role, password };
        const personal = { matricule: String(matricule || ''), firstName, lastName, email, phoneNumber: cleanedNumber };
        const work = { factorySite, segment };
        validUsers.push({ user, personal, work });
      });

      if (errors.length > 0) {
        alert(`Errors found:\n\n${errors.join('\n')}`);
        return;
      }

      this.authService.importedUsers = validUsers;
      this.isImportedData = true;
      alert(`${validUsers.length} user(s) imported successfully.`);

      setTimeout(() => {
        this.formSubmit.emit(validUsers);
        this.stepChange.emit(3);
      }, 100);
    };

    reader.readAsArrayBuffer(file);
  }

  onSubmit() {
    const role = this.accountForm.get('role')?.value;

    if (!this.accountForm.valid) {
      this.accountForm.markAllAsTouched();
      alert('Please fill in all required fields.');
      return;
    }

    if (role === 'OPERATEUR' || role === 'QM') {
      const matricule = this.accountForm.get('matricule')?.value;
      const factorySite = this.accountForm.get('factorySite')?.value;
      if (String(matricule).length < 5) {
        alert('Matricule must be at least 5 characters.');
        return;
      }
      const password = String(matricule).substring(0, 5) + factorySite;
      this.accountForm.get('password')?.setValue(password);
    }

    const formValue = this.accountForm.getRawValue();
    this.authService.accountDetails = formValue;
    this.formSubmit.emit(formValue);
    this.stepChange.emit(1);
  }
}
