import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MachineService } from '../../../../services/machine.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Machine } from '../../../../models/machine.model';

interface Segment {
  id: number;
  segmentName: string;
  plantSiteName: string;
}

@Component({
  selector: 'app-add-machines',
  standalone: false,
  templateUrl: './add-machines.component.html',
  styleUrl: './add-machines.component.css'
})
export class AddMachinesComponent implements OnInit {
  machineForm!: FormGroup;

  // Dropdown options
  machineNumbers: string[] = [];
  machineTypes: string[] = [];
  clients: string[] = [];
  plantSiteNames: string[] = [];
  segments: Segment[] = []; // Optional: can stay for type, but won't be used globally
  filteredSegments: Segment[] = []; // ✅ Segments filtered by plant (from backend)

  machines: Machine[] = [];

  constructor(
    private fb: FormBuilder,
    private machineService: MachineService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadDropdownData();
    this.loadMachines();

    // ✅ Watch for plant site changes and load segments from backend
    this.machineForm.get('plantSiteName')?.valueChanges.subscribe((plantSiteName: string) => {
      if (plantSiteName) {
        this.loadSegmentsForPlant(plantSiteName);
      } else {
        this.filteredSegments = [];
        this.machineForm.get('segmentName')?.setValue('');
      }
    });
  }

  private initForm(): void {
    this.machineForm = this.fb.group({
      nrMachine: ['', Validators.required],
      type: ['', Validators.required],
      client: ['', Validators.required],
      plantSiteName: ['', Validators.required],
      segmentName: ['', Validators.required]
    });
  }

  private loadDropdownData(): void {
    // Load machine numbers
    this.machineService.getMachineNumbers().subscribe({
      next: (numbers) => this.machineNumbers = numbers,
      error: () => this.snackBar.open('Could not load machine numbers', 'Close', { duration: 5000 })
    });

    // Load machine types
    this.machineService.getMachineTypes().subscribe({
      next: (types) => this.machineTypes = types,
      error: () => this.snackBar.open('Could not load machine types', 'Close', { duration: 5000 })
    });

    // Load clients
    this.machineService.getClients().subscribe({
      next: (clients) => this.clients = clients,
      error: () => this.snackBar.open('Could not load clients', 'Close', { duration: 5000 })
    });

    // Load plant site names
    this.machineService.getPlantSites().subscribe({
      next: (sites) => this.plantSiteNames = sites,
      error: () => this.snackBar.open('Could not load plant sites', 'Close', { duration: 5000 })
    });

    // ❌ Removed: getAllSegments() → now loaded per plant
  }

  private loadSegmentsForPlant(plantSiteName: string): void {
    this.machineService.getSegmentsByPlantSite(plantSiteName).subscribe({
      next: (segments) => {
        this.filteredSegments = segments;
        console.log(`Loaded ${segments.length} segments for plant: ${plantSiteName}`);
      },
      error: (err) => {
        console.error('Failed to load segments for plant:', plantSiteName, err);
        this.filteredSegments = [];
        this.snackBar.open('Could not load segments for this plant', 'Close', { duration: 5000 });
      }
    });
  }

  private loadMachines(): void {
    this.machineService.getAllMachines().subscribe({
      next: (machines) => this.machines = machines,
      error: (err) => console.error('Failed to load machines', err)
    });
  }

  addMachine(): void {
  if (this.machineForm.invalid) {
    this.snackBar.open('Please fill all fields', 'Close', { duration: 3000 });
    return;
  }

  const formValue = this.machineForm.value;

  const selectedSegment = this.filteredSegments.find(
    s => s.segmentName === formValue.segmentName
  );

  if (!selectedSegment) {
    this.snackBar.open('Please select a valid segment from the list', 'Close', { duration: 4000 });
    return;
  }

  // ✅ SEND FLAT FIELDS TO MATCH MachineDTO
  const payload = {
    nrMachine: formValue.nrMachine,
    type: formValue.type,
    client: formValue.client,
    plantSiteName: formValue.plantSiteName,
    segmentName: selectedSegment.segmentName  // ← top-level string
  };

  this.machineService.addMachine(payload).subscribe({
    next: () => {
      this.snackBar.open('✅ Machine added successfully', 'Close', { duration: 3000 });
      this.resetForm();
      this.loadMachines();
    },
    error: (err) => {
      const message = err.error?.message || 'Failed to add machine';
      this.snackBar.open(`❌ Error: ${message}`, 'Close', { duration: 5000 });
      console.error('Error adding machine', err);
    }
  });
}

  private resetForm(): void {
    this.machineForm.reset();
    this.filteredSegments = []; // Clear filtered segments
  }
}