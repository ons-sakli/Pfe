import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EnumService } from '../../services/EnumService.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-update-profile-dialog',
  templateUrl: './update-profile-dialog.component.html',
  styleUrls: ['./update-profile-dialog.component.css'],
  standalone: false // Indicates this is not a standalone component
})
export class UpdateProfileDialogComponent implements OnInit {
  groupes: { value: string; label: string }[] = [];
  profileForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private enumService: EnumService,
    public dialogRef: MatDialogRef<UpdateProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

ngOnInit(): void {
    const groupeValue = this.mapGroupeToValue(this.data.groupe);

  this.profileForm = this.fb.group({
    username: [this.data.username || ''],
    opMat: [this.data.opMat || ''],
    segment: [this.data.segment || ''], // Default to an empty string if missing
    groupe: [groupeValue] 
      // Default to an empty string if missing
  });

    // Fetch the Groupe enum values
this.enumService.getGroupes().subscribe((groupeMap) => {
  this.groupes = Object.entries(groupeMap).map(([value, label]) => ({ value, label }));
  console.log('Processed groupes:', this.groupes);
});
console.log('Initial groupe value:', this.data.groupe);
}


  onSubmit(): void {
    if (this.profileForm.valid) {
      // Close the dialog and return the updated user data
      this.dialogRef.close(this.profileForm.value);
    }
  }

  closeDialog(): void {
    // Close the dialog without saving changes
    this.dialogRef.close();
  }

// Helper method to map groupe label to value
private mapGroupeToValue(groupeLabel: string): string {
  const mapping: { [key: string]: string } = {
    'Morning': 'MATIN',
    'Evening': 'SOIR',
    'Night': 'NUIT'
  };
  return mapping[groupeLabel] || ''; // Default to empty string if no match
}
}