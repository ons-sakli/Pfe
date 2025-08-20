import { Component } from '@angular/core';
import { MachineService } from '../../../../services/machine.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-machines',
  standalone: false,
  templateUrl: './delete-machines.component.html',
  styleUrl: './delete-machines.component.css'
})
export class DeleteMachinesComponent {

  machineNr: string = '';

  constructor(
    private machineService: MachineService,
    private snackBar: MatSnackBar
  ) {}

  deleteMachine() {
    if (!this.machineNr) {
      this.snackBar.open('Please enter a machine number.', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.machineService.deleteMachine(this.machineNr).subscribe({
      next: () => {
        this.snackBar.open(`Machine ${this.machineNr} deleted successfully.`, 'Close', {
          duration: 3000,
        });
        this.machineNr = '';
      },
      error: () => {
        this.snackBar.open(`Failed to delete machine ${this.machineNr}.`, 'Close', {
          duration: 3000,
        });
      },
    });
  }
}
