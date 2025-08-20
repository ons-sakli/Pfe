import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardServiceService } from '../../../services/dashboard-service.service';
import { Test } from '../../../models/test.models';
import { Machine } from '../../../models/machine.model';
import { WireSection } from '../../../models/wireSection.model';
import { Router } from '@angular/router';

// Response from backend
interface PerformanceData {
  xChart: { labels: string[]; values: number[]; limit: number };
  rChart: { labels: string[]; values: number[]; limit: number };
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  totalOperators = 0;
  totalQMs = 0;
  totalTests = 0;
  totalSegments = 0;
  totalMachines = 0;

  recentPassingTests: Test[] = [];

  // Dropdown lists
  allMachines: Machine[] = [];
  allSections: WireSection[] = [];

  // Selections
  selectedMachine: string = '';
  selectedSection: string = '';

  // Chart data
  meanChartData: any = null;
  rangeChartData: any = null;
  meanChartOptions: any;
  rangeChartOptions: any;
machineStats = { good: 0, warning: 0, risky: 0, overallRating: '✅' };

  // UI state
  hasData = false;

  constructor(
    private dashboardService: DashboardServiceService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadSummaryData();
    this.loadRecentTests();
    this.loadMachineAndSectionLists();
      this.loadMachinePerformanceSummary(); // 👈 New

  }
loadMachinePerformanceSummary(): void {
  this.dashboardService.getMachinePerformanceSummary().subscribe(data => {
    this.machineStats = {
      good: data.good,
      warning: data.warning,
      risky: data.risky,
      overallRating: data.overallRating
    };
  });
}
  // === Load Summary Data ===
loadSummaryData(): void {
  this.dashboardService.getUserCounts().subscribe({
    next: (data) => {
      // Defensive checks in case backend misbehaves
      this.totalOperators = data?.operators ?? 0;
      this.totalQMs       = data?.qms ?? 0;
    },
    error: (err) => {
      console.error('Failed to load user counts', err);
      this.totalOperators = 0;
      this.totalQMs = 0;
    }
  });

  this.dashboardService.getTotalTests().subscribe({
    next: (data) => this.totalTests = data || 0,
    error: () => this.totalTests = 0
  });

  this.dashboardService.getTotalSegments().subscribe({
    next: (data) => this.totalSegments = data || 0,
    error: () => this.totalSegments = 0
  });

  this.dashboardService.getTotalMachines().subscribe({
    next: (data) => this.totalMachines = data || 0,
    error: () => this.totalMachines = 0
  });
}

  // === Load Recent Passing Tests (only 2 most recent) ===
  loadRecentTests(): void {
    this.dashboardService.getPassingTests().subscribe(data => {
      this.recentPassingTests = data
        .sort((a, b) => new Date(b.dateTest).getTime() - new Date(a.dateTest).getTime())
        .slice(0, 2);
    });
  }

  // === Load Dropdown Lists ===
  loadMachineAndSectionLists(): void {
    this.dashboardService.getAllMachines().subscribe(machines => {
      this.allMachines = machines;
    });

    this.dashboardService.getAllWireSections().subscribe(sections => {
      this.allSections = sections;
    });

    // ✅ Auto-load most recent test after lists are loaded
    this.loadMostRecentTest();
  }

  // === Load Most Recent Test and Auto-Select ===
  loadMostRecentTest(): void {
    this.dashboardService.getPassingTests().subscribe(data => {
      if (data.length === 0) return;

      const recentTest = data
        .sort((a, b) => new Date(b.dateTest).getTime() - new Date(a.dateTest).getTime())[0];

      this.selectedMachine = recentTest.machineId;
      this.selectedSection = recentTest.wireSection;

      this.loadPerformance();
    });
  }

  // === On Selection Change ===
  onSelectionChange(): void {
    if (this.selectedMachine && this.selectedSection) {
      this.loadPerformance();
    } else {
      this.clearCharts();
    }
  }

  // === Load Performance for Selected Machine & Section ===
  loadPerformance(): void {
    const to = new Date();
    const from = new Date(to);
    from.setMonth(to.getMonth() - 1); // Last 30 days

    this.dashboardService.getPerformanceByMachineAndSection(
      this.selectedMachine,
      this.selectedSection,
      from,
      to
    ).subscribe({
      next: (data: PerformanceData) => {
        if (!data || !data.xChart || data.xChart.labels.length === 0) {
          this.clearCharts();
          return;
        }

        this.hasData = true;
        this.buildCharts(data);
      },
      error: (err) => {
        console.error('Failed to load performance data', err);
        this.clearCharts();
      }
    });
  }

  // === Build Charts from API Data ===
  buildCharts(data: PerformanceData): void {
    
    // X̄ Chart
    this.meanChartData = {
      datasets: [
        {
          data: data.xChart.values.map((value: number, i: number) => ({
            x: data.xChart.labels[i],
            y: value
          })),
          label: 'Daily Avg X̄',
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.2)',
          tension: 0.3,
          fill: false
        }
      ]
    };

    // R Chart
    this.rangeChartData = {
      datasets: [
        {
          data: data.rChart.values.map((value: number, i: number) => ({
            x: data.rChart.labels[i],
            y: value
          })),
          label: 'Daily Avg R',
          borderColor: '#17a2b8',
          backgroundColor: 'rgba(23, 162, 184, 0.2)',
          tension: 0.3,
          fill: false
        }
      ]
    };

    // Update limit lines
    if (this.meanChartOptions?.plugins?.annotation?.annotations?.limit) {
      this.meanChartOptions.plugins.annotation.annotations.limit.yMin = data.xChart.limit;
      this.meanChartOptions.plugins.annotation.annotations.limit.yMax = data.xChart.limit;
    }

    if (this.rangeChartOptions?.plugins?.annotation?.annotations?.limit) {
      this.rangeChartOptions.plugins.annotation.annotations.limit.yMin = data.rChart.limit;
      this.rangeChartOptions.plugins.annotation.annotations.limit.yMax = data.rChart.limit;
    }

    this.cdr.detectChanges();
  }

  // === Clear Charts ===
  clearCharts(): void {
    this.meanChartData = null;
    this.rangeChartData = null;
    this.hasData = false;
    this.cdr.detectChanges();
  }

  // === Initialize Chart Options ===
  private initChartOptions(): void {
    this.meanChartOptions = this.createChartOptions('Mean (X̄)', 'Limit', '#dc3545');
    this.rangeChartOptions = this.createChartOptions('Range (R)', 'R Limit', '#dc3545');
  }

  // === Create Chart Options ===
  private createChartOptions(yTitle: string, limitLabel: string, limitColor: string) {
    return {
      responsive: true,
      plugins: {
        title: { display: true, text: yTitle },
        annotation: {
          annotations: {
            limit: {
              type: 'line',
              yMin: 0,
              yMax: 0,
              borderColor: limitColor,
              borderWidth: 2,
              label: {
                display: true,
                content: limitLabel,
                color: 'white',
                backgroundColor: limitColor,
                position: 'start'
              }
            },
            monthDivider: {
              type: 'line',
              xMin: '2025-08-01',
              xMax: '2025-08-01',
              borderColor: 'rgba(133, 131, 131, 0.57)',
              borderWidth: 1,
              borderDash: [5, 5],
              label: {
                display: true,
                content: 'Aug',
                color: 'white',
                backgroundColor: 'rgba(173, 169, 169, 0.7)',
                font: { size: 10 },
                position: 'start'
              }
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'dd MMM yyyy',
            displayFormats: { day: 'dd MMM' }
          },
          title: { text: 'Date' }
        },
        y: {
          title: { text: yTitle },
          beginAtZero: true
        }
      },
      elements: {
        line: { tension: 0.3, fill: false, borderWidth: 2 },
        point: {
          radius: 4,
          backgroundColor: '#fff',
          borderColor: '#007bff',
          borderWidth: 2,
          hoverRadius: 6
        }
      },
      interaction: { intersect: false, mode: 'index' },
      maintainAspectRatio: false
    };
  }

  // === Navigation ===
  viewAllPassingTests(): void {
    this.router.navigate(['/admin/testHistory']);
  }
  refresh(): void {
  if (this.selectedMachine && this.selectedSection) {
    this.loadPerformance();
  }
}
}