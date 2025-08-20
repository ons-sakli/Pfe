import { Component, inject, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Machine, Segment } from '../../../../models/machine.model';
import { MachineService } from '../../../../services/machine.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-machine-dialog',
  templateUrl: './edit-machine-dialog.component.html',
  styleUrls: ['./edit-machine-dialog.component.css'],
  standalone: false,
})
export class EditMachineDialogComponent implements OnInit {
  machineForm!: FormGroup;
  updatedMachine: Machine;

  machineTypes: string[] = [];
  clients: string[] = [];
  plantSiteNames: string[] = [];
  segments: Segment[] = [];

  // Inject snackBar
  private snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<EditMachineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Machine,
    private fb: FormBuilder,
    private machineService: MachineService
  ) {
    this.updatedMachine = { ...data };
  }

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();

    // ✅ Watch for plant site changes and reload segments
    this.machineForm.get('plantSiteName')?.valueChanges.subscribe((plantSiteName: string) => {
      if (plantSiteName) {
        this.loadSegmentsForPlant(plantSiteName);
      }
    });

    // ✅ Load segments for initial plant site
    const initialPlant = this.machineForm.get('plantSiteName')?.value;
    if (initialPlant) {
      this.loadSegmentsForPlant(initialPlant);
    }
  }

  private initForm() {
    this.machineForm = this.fb.group({
      type: [this.updatedMachine.type, Validators.required],
      client: [this.updatedMachine.client, Validators.required],
      plantSiteName: [this.updatedMachine.plantSiteName, Validators.required],
      segmentName: [this.updatedMachine.segment?.segmentName || '', Validators.required],
    });
  }

  loadOptions() {
    // Load static lists
    this.machineService.getMachineTypes().subscribe({ next: (data) => (this.machineTypes = data) });
    this.machineService.getClients().subscribe({ next: (data) => (this.clients = data) });
    this.machineService.getPlantSites().subscribe({ next: (data) => (this.plantSiteNames = data) });
    // ❌ Removed: getAllSegments() — now loaded per plant
  }

  loadSegmentsForPlant(plantSiteName: string) {
    this.machineService.getSegmentsByPlantSite(plantSiteName).subscribe({
      next: (segments) => {
        this.segments = segments;
        console.log(`Loaded ${segments.length} segments for plant: ${plantSiteName}`, segments);
      },
      error: (err) => {
        console.error('Failed to load segments for plant:', plantSiteName, err);
        this.segments = [];
        this.snackBar.open('Failed to load segments', 'Close', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.machineForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }

    const formValue = this.machineForm.value;

    // Find selected segment in filtered list
    const selectedSegment = this.segments.find(
      s => s.segmentName === formValue.segmentName
    );

    // 🔒 Prevent saving if segment not found
    if (!selectedSegment) {
      this.snackBar.open(
        `Segment "${formValue.segmentName}" is not valid for the selected plant.`,
        'Close',
        { duration: 4000 }
      );
      return;
    }

    // ✅ SEND FLAT PAYLOAD TO MATCH MachineDTO
    const payload = {
      nrMachine: this.updatedMachine.nrMachine,
      type: formValue.type,
      client: formValue.client,
      plantSiteName: formValue.plantSiteName,
      segmentName: selectedSegment.segmentName  // ← top-level string
    };

    this.dialogRef.close(payload);
  }
}