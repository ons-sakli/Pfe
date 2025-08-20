import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MachineService } from '../../services/machine.service';
import { WireSectionService } from '../../services/wire-section.service';
import { TestDto, TestService } from '../../services/test.service';
import { AuthService } from '../../services/auth.service';
import { Machine } from '../../models/machine.model';
import { WireSection } from '../../models/wireSection.model';

@Component({
  selector: 'app-launch-test',
  templateUrl: './launch-test.component.html',
  styleUrls: ['./launch-test.component.css'],
  standalone: false
})
export class LaunchTestComponent implements OnInit {

  machines: Machine[] = [];
  wireSections: WireSection[] = [];

  selectedMachine: Machine | null = null;
  selectedSection: WireSection | null = null;

  pelageLimit: number | null = null;
  backupPelageLimit!: number | null;
  rLimit: number | null = null;

  // ✅ User identifier: operatorMat or qmMat
  currentUserMat: string = '';
  isOperator = false;
  isQM = false;

  formData = {
    machine: '',
    sampleNumber: 5, // Default for Operator
    wireSection: '', // will store section ID
    dateTest: new Date().toISOString()
  };

  constructor(
    private machineService: MachineService,
    private testService: TestService,
    private wireSectionService: WireSectionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // ✅ Determine role and set identifier
    const userRole = this.authService.getUserRole()?.toUpperCase();
    this.isOperator = userRole === 'OPERATEUR';
    this.isQM = userRole === 'QM';
 const state = history.state;
  console.log('Traction Min:', state.tractionMin); // Use this value when saving to measurement table

    if (this.isOperator) {
      this.currentUserMat = this.authService.getCurrentOperatorMat() || '';
      this.formData.sampleNumber = 5;
    } else if (this.isQM) {
      this.currentUserMat = this.authService.getCurrentQmMat() || '';
    this.formData.sampleNumber = this.isQM ? 1 : 5;
    }

 if (!this.currentUserMat) {
  alert('User identifier not found. Please log in again.');
  this.router.navigate(['/login']);
  return; // Exit the method
}

    // ✅ Load machines and wire sections
    this.machineService.getAllMachines().subscribe({
      next: (data) => this.machines = data,
      error: (err) => console.error('Error fetching machines', err),
    });

    this.wireSectionService.getAllSections().subscribe({
      next: (data) => this.wireSections = data,
      error: (err) => console.error('Error fetching wire sections', err),
    });
  }

  onMachineChange(event: any) {
    const nr = event.target.value;
    this.selectedMachine = this.machines.find(m => m.nrMachine === nr) || null;
    this.formData.machine = nr;
  }

  onSectionChange() {
    const id = Number(this.formData.wireSection);
    this.selectedSection = this.wireSections.find(s => s.id === id) || null;

    console.log('🔍 Selected section:', this.selectedSection);

    if (this.selectedSection) {
      this.pelageLimit = this.selectedSection.pelageLimit;
      this.backupPelageLimit = this.pelageLimit != null ? this.pelageLimit + 4 : null;
      this.rLimit = this.selectedSection.rlimit; // ✅ Use 'rlimit' from backend
      console.log('✅ Limits set → pelage:', this.pelageLimit, 'R:', this.rLimit);
    } else {
      this.pelageLimit = null;
      this.rLimit = null;
      this.backupPelageLimit = null;
      console.log('❌ No section selected');
    }
  }

  onSubmit(): void {
    if (!this.formData.machine || !this.formData.wireSection) {
      alert('Please select Machine and Wire Section');
      return;
    }

    const selectedWireSection = this.wireSections.find(
      s => s.id === Number(this.formData.wireSection)
    );

    if (!selectedWireSection) {
      alert('Selected wire section not found!');
      return;
    }

    const sectionName = selectedWireSection.section;

    // ✅ Prepare test payload with correct identifier
    const testPayload = {
      machineId: this.formData.machine,
      wireSection: sectionName,
      operatorMat: this.isOperator ? this.currentUserMat : undefined,
      qmMat: this.isQM ? this.currentUserMat : undefined,
      sampleNumber: this.formData.sampleNumber,
     tractionMin: this.selectedSection?.tracMin,
      dateTest: new Date().toISOString()
    };

    // ✅ Try to get existing test first
    this.testService.getLatestForPrefill(this.formData.machine, sectionName).subscribe({
      next: (existingTest: TestDto) => {
        console.log('✅ Found existing test:', existingTest);
  console.log('🚀 LaunchTest: tractionMin =', this.selectedSection?.tracMin);

        // ✅ Navigate with prefilled data
        this.router.navigate(['/measurement-table'], {
          state: {
            savedTestId: existingTest.testId,
            formData: this.formData,
            pelageLimit: this.pelageLimit,
            backupPelageLimit: this.backupPelageLimit,
            rLimit: this.rLimit,
    tractionMin: this.selectedSection?.tracMin , // ✅ Ensure this is not null
            operatorMat: this.isOperator ? this.currentUserMat : undefined,
            qmMat: this.isQM ? this.currentUserMat : undefined
          }
        });
      },
      error: () => {
        console.log('No existing test found. Creating new...');

        // ✅ No existing test → create new one
        this.testService.createOrGetTest(testPayload).subscribe({
          next: (newTest: TestDto) => {
            console.log('🆕 Created new test:', newTest);

            this.router.navigate(['/measurement-table'], {
              state: {
                savedTestId: newTest.testId,
                formData: this.formData,
                pelageLimit: this.pelageLimit,
                backupPelageLimit: this.backupPelageLimit,
                rLimit: this.rLimit,
                tractionMin: this.selectedSection?.tracMin, // ✅ Add this
                operatorMat: this.isOperator ? this.currentUserMat : undefined,
                qmMat: this.isQM ? this.currentUserMat : undefined
              }
            });
          },
          error: (createErr) => {
            console.error('Error creating test:', createErr);
            alert('❌ Failed to create test.');
          }
        });
      }
    });
  }
}