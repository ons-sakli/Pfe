import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MachineService } from '../../../services/machine.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Machine, Segment } from '../../../models/machine.model';
import { EditMachineDialogComponent } from './edit-machine-dialog/edit-machine-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-machines',
  templateUrl: './manage-machines.component.html',
  styleUrls: ['./manage-machines.component.css'],
  standalone: false,
})
export class ManageMachinesComponent implements OnInit {
  machineForm!: FormGroup;
  machines: any[] = [];
  segments: Segment[] = []; // Load segments from backend
  editing = false;
  deleteNrMachine: string = '';
  displayedColumns: string[] = ['nrMachine', 'client', 'type', 'segment','plantSiteName', 'actions'];

  constructor(
    private fb: FormBuilder,
    private machineService: MachineService,
    private snackBar: MatSnackBar,
      private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadMachines();
    this.loadSegments();
  }

  private initForm() {
    this.machineForm = this.fb.group({
      nrMachine: ['', Validators.required],
      client: ['', Validators.required],
      type: ['', Validators.required],
      segmentId: ['', Validators.required],
      
    });
  }
loadMachines() {
  this.machineService.getAllMachines().subscribe({
    next: (data) => {
this.machines = data;
   },
    error: () => this.snackBar.open('Failed to load machines', 'Close', { duration: 3000 }),
  });
}

  loadSegments() {
    this.machineService.getAllSegments().subscribe({
      next: (data) => (this.segments = data),
      error: () => this.snackBar.open('Failed to load segments', 'Close', { duration: 3000 }),
    });
  }
  onSubmit() {
    if (this.machineForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 3000 });
      return;
    }
    // Build payload
    const segmentId = this.machineForm.value.segmentId;
    const fullSegment = this.segments.find(s => s.id === segmentId);

    if (!fullSegment) {
      console.error('Segment not found!');
      return;
    }
const payload: Machine = { 
  nrMachine: this.machineForm.value.nrMachine,
  client: this.machineForm.value.client,
  type: this.machineForm.value.type,
  plantSiteName: this.machineForm.value.plantSiteName, // use the form value
  active: this.machineForm.value.active, // ✅ added active field
  segment: {
    id: fullSegment.id,
    segmentName: fullSegment.segmentName,
    plantSiteName: this.machineForm.value.plantSiteName // overwrite with form value
  }
};
    const request$ = this.editing
      ? this.machineService.updateMachine(payload)
      : this.machineService.addMachine(payload);

    request$.subscribe({
      next: () => {
        this.snackBar.open(
          `Machine ${this.editing ? 'updated' : 'added'} successfully`,
          'Close',
          { duration: 3000 }
        );
        this.resetForm();
        this.loadMachines();
      },
      error: () => {
        this.snackBar.open('Failed to save machine', 'Close', { duration: 3000 });
      },
    });
  }
editMachine(machine: Machine) {
  const fullSegment = this.segments.find(s => s.id === machine.segment?.id);

  const machineWithFlatSegment = {
    ...machine,
    segmentName: fullSegment?.segmentName || machine.segment?.segmentName,
    plantSiteName: machine.plantSiteName
  };

  const dialogRef = this.dialog.open(EditMachineDialogComponent, {
    width: '500px',
    data: machineWithFlatSegment
  });

  dialogRef.afterClosed().subscribe((result: any) => {
    if (result) {
      this.machineService.updateMachine(result).subscribe(() => this.loadMachines());
    }
  });
}

  private resetForm() {
    this.machineForm.reset();
    this.editing = false;
  }
}
