import { Component, OnInit } from '@angular/core';
import { TestDto, TestService } from '../../../services/test.service';
import { Router } from '@angular/router';
import { WireSectionService } from '../../../services/wire-section.service';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-historique',
  standalone: false,
  templateUrl: './testHistory.component.html',
  styleUrl: './testHistory.component.css'
})
export class testHistoryComponent implements OnInit {

  tests: TestDto[] = [];
  filteredTests: TestDto[] = [];

  // Search filters
  search = {
   dateTest: '',
  fromDate: '',
  toDate: '',
  machineId: '',
  wireSection: ''
  };

  // Pagination
  currentPageIndex = 0;
  itemsPerPage = 5;
  totalItems = 0;

  constructor(
    private testService: TestService,
    private wireSectionService: WireSectionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllPassingTests();
  }

  loadAllPassingTests(): void {
    // ✅ Send filters to backend (backend handles role-based filtering)
    const params: any = {};
    if (this.search.dateTest) params.dateTest = this.search.dateTest;
    if (this.search.machineId) params.machineId = this.search.machineId;
    if (this.search.wireSection) params.wireSection = this.search.wireSection;

    this.testService.getTestHistory(params).subscribe({
      next: (data: TestDto[]) => {
        this.tests = data;
        this.applyFilter(); // Apply frontend filter for search
      },
      error: (err) => {
        console.error('Failed to load test history', err);
        this.tests = [];
        this.applyFilter();
      }
    });
  }

applyFilter(): void {
    console.log('Filtering with:', {
    fromDate: this.search.fromDate,
    toDate: this.search.toDate,
    machineId: this.search.machineId,
    wireSection: this.search.wireSection
  });
  const from = this.search.fromDate ? this.search.fromDate : null;  // "2025-08-19"
  const to = this.search.toDate ? this.search.toDate : null;

  this.filteredTests = this.tests.filter(test => {
    // ✅ Extract date part from test.dateTest (if it's a timestamp)
    const testDateStr = test.dateTest?.split('T')[0]; // "2025-08-19"

    // ✅ Date Range Check (string comparison works for YYYY-MM-DD)
    let matchesDate = true;
    if (from || to) {
      if (!testDateStr) return false;

      if (from && testDateStr < from) matchesDate = false;
      if (to && testDateStr > to) matchesDate = false;
    }

    // ✅ Machine ID
    const matchesMachine = !this.search.machineId || 
      test.machineId?.toLowerCase().includes(this.search.machineId.toLowerCase());

    // ✅ Wire Section
    const matchesWireSection = !this.search.wireSection || 
      test.wireSection?.toLowerCase().includes(this.search.wireSection.toLowerCase());

    return matchesDate && matchesMachine && matchesWireSection;
  });

  this.totalItems = this.filteredTests.length;
  this.currentPageIndex = 0;
}
  onPageChange(event: PageEvent): void {
    this.currentPageIndex = event.pageIndex;
    this.itemsPerPage = event.pageSize;
  }

  get paginatedTests(): TestDto[] {
    const start = this.currentPageIndex * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredTests.slice(start, end);
  }

 clearFilters(): void {
  this.search = {
    dateTest: '',
  fromDate: '',
  toDate: '',
  machineId: '',
  wireSection: ''
  };
  this.loadAllPassingTests();
}
viewDetails(test: TestDto): void {
  console.log('👉 View Details clicked for test:', test);
  console.log('operatorMat:', test.operatorMat, 'qmMat:', test.qmMat);  // <-- add here

  const currentUserRole = this.authService.getUserRole();

  this.wireSectionService.getSectionBySectionName(test.wireSection).subscribe({
    next: (wireSection) => {
      this.router.navigate(['/measurement-table'], {
        state: {
          savedTestId: test.testId,
          operatorMat: currentUserRole === 'ROLE_ADMIN' ? test.operatorMat : (test.operatorMat || test.qmMat),
          qmMat: currentUserRole === 'ROLE_ADMIN' ? null : test.qmMat,
          machineId: test.machineId,
          wireSection: test.wireSection,
          pelageLimit: wireSection.pelageLimit,
          backupPelageLimit: (wireSection.pelageLimit ?? 0) + 4,
          rLimit: wireSection.rlimit
        }
      });
    },
    error: (err) => {
      console.error('Failed to load limits for section:', test.wireSection, err);
      this.router.navigate(['/measurement-table'], {
        state: {
          savedTestId: test.testId,
          operatorMat: currentUserRole === 'ROLE_ADMIN' ? test.operatorMat : (test.operatorMat || test.qmMat),
          qmMat: currentUserRole === 'ROLE_ADMIN' ? null : test.qmMat,
          machineId: test.machineId,
          wireSection: test.wireSection,
          pelageLimit: null,
          backupPelageLimit: null,
          rLimit: null
        }
      });
    }
  });
}

}