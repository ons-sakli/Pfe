import { Component, OnInit } from '@angular/core';
import { MachineService } from '../../../../services/machine.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Machine } from '../../../../models/machine.model';
import { MatDialog } from '@angular/material/dialog';
import { EditMachineDialogComponent } from '../edit-machine-dialog/edit-machine-dialog.component';

@Component({
  selector: 'app-consult-update-machines',
  standalone: false,
  templateUrl: './consult-update-machines.component.html',
  styleUrls: ['./consult-update-machines.component.css']
})
export class ConsultUpdateMachinesComponent implements OnInit {
  machines: Machine[] = [];
  filteredMachines: Machine[] = []; // ✅ Hold filtered list
  columns: string[] = ['nrMachine', 'client', 'type', 'segmentName', 'plantSiteName', 'actions'];

  // Pagination state
  pageSize = 5;
  currentPage = 0;

  // Search term
  searchTerm: string = ''; // ✅ Add search term

  constructor(
    private machineService: MachineService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.machineService.getAllMachines().subscribe({
      next: (data) => {
        this.machines = data;
        this.filteredMachines = [...data]; // ✅ Initialize filtered list
      },
      error: (err) => console.error('Error loading machines', err),
    });
  }

  // ✅ Filter machines based on search term
  onSearch(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.filteredMachines = this.machines.filter(m =>
      !this.searchTerm ||
      m.nrMachine.toLowerCase().includes(this.searchTerm) ||
      m.type.toLowerCase().includes(this.searchTerm) ||
      m.client.toLowerCase().includes(this.searchTerm) ||
      (m.segment?.segmentName || '').toLowerCase().includes(this.searchTerm) ||
      (m.plantSiteName || '').toLowerCase().includes(this.searchTerm)
    );
    this.currentPage = 0; // ✅ Reset to first page
  }

  // ✅ Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearch('');
  }
applyFilter(event: Event): void {
  const value = (event.target as HTMLInputElement).value.trim().toLowerCase();
  this.searchTerm = value;

  this.filteredMachines = this.machines.filter(m =>
    m.nrMachine.toLowerCase().includes(value)
  );

  this.currentPage = 0; // reset pagination
}
  // ✅ Computed subset of machines to show based on pagination
  get paginatedMachines(): Machine[] {
    const startIndex = this.currentPage * this.pageSize;
    return this.filteredMachines.slice(startIndex, startIndex + this.pageSize);
  }


  // ✅ Handler for page change
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  // ✅ Update Machine
  updateMachine(machine: Machine): void {
    const dialogRef = this.dialog.open(EditMachineDialogComponent, {
      width: '400px',
      data: machine
    });

    dialogRef.afterClosed().subscribe((result: Machine | undefined) => {
      if (result) {
        this.machineService.updateMachine(result).subscribe({
          next: () => {
            this.snackBar.open(`Machine ${result.nrMachine} updated successfully.`, 'Close', { duration: 3000 });
            const index = this.machines.findIndex(m => m.nrMachine === result.nrMachine);
            if (index > -1) {
              this.machines[index] = result;
              // Also update filtered list
              const filteredIndex = this.filteredMachines.findIndex(m => m.nrMachine === result.nrMachine);
              if (filteredIndex > -1) {
                this.filteredMachines[filteredIndex] = result;
              }
            }
          },
          error: () => {
            this.snackBar.open(`Failed to update ${result.nrMachine}.`, 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  // ✅ Toggle Machine Status
  toggleMachineStatus(machine: Machine): void {
    const newStatus = !machine.active;

    this.machineService.toggleMachineStatus(machine.nrMachine, newStatus).subscribe({
      next: () => {
        machine.active = newStatus;
        // Sync across lists
        const original = this.machines.find(m => m.nrMachine === machine.nrMachine);
        if (original) original.active = newStatus;

        const filtered = this.filteredMachines.find(m => m.nrMachine === machine.nrMachine);
        if (filtered) filtered.active = newStatus;

        this.snackBar.open(
          `Machine ${machine.nrMachine} ${newStatus ? 'activated' : 'deactivated'} successfully.`,
          'Close',
          { duration: 3000 }
        );
      },
      error: () => {
        this.snackBar.open(
          `Failed to ${newStatus ? 'activate' : 'deactivate'} machine ${machine.nrMachine}.`,
          'Close',
          { duration: 3000 }
        );
      }
    });
  }
}