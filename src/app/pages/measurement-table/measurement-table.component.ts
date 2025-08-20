import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { MeasurementService } from '../../services/measurement.service';
import { Measurement } from '../../models/measurement.model';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/Alert.service';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { MatSnackBar } from '@angular/material/snack-bar';
type Result = 'PASS' | 'ALERT' | 'FAIL';
@Component({
  selector: 'app-measurement-table',
  templateUrl: './measurement-table.component.html',
  styleUrls: ['./measurement-table.component.css'],
  standalone: false
})
export class MeasurementTableComponent implements OnInit, AfterViewInit {
  /* ─────────── table & data ─────────── */
  columns = Array.from({ length: 15 }, (_, i) => i);
  tracMin: number | null = null;
  measurements: (string | number)[][] = [];
  means: (number | null)[] = Array(15).fill(null);
  ranges: (number | null)[] = Array(15).fill(null);
  tractionMins: (number | null)[] = Array(15).fill(null); // One per column
columnResults: ('PASS' | 'ALERT' | 'FAIL')[] = Array(15).fill('PASS');
  savedColumns: boolean[] = Array(15).fill(false);
  columnDates: (string | null)[] = Array(15).fill(null);
  testId!: number;
  formData!: any;
  pelageLimit!: number | null;
  backupPelageLimit!: number | null;
  rLimit!: number | null;
  userMat!: string;  
workingMeasurements: (string | number)[][] = [];
  showRawData = false; // Show raw data inputs after Calculate
  @ViewChild('meanChart') meanChart?: BaseChartDirective<'line'>;
  @ViewChild('rangeChart') rangeChart?: BaseChartDirective<'line'>;
  meanData!: ChartConfiguration<'line'>['data'];
  rangeData!: ChartConfiguration<'line'>['data'];
  meanOpts!: ChartOptions<'line'>;
  rangeOpts!: ChartOptions<'line'>;
 isOperator = false;
  isQM = false; // New flag for QM
  isAdmin = false; // New flag for Admin
  showCharts = false;
  hasSavedThisSession = false;
// Track hidden columns
hiddenColumns: boolean[] = Array(15).fill(false);
hiddenReasons: (string | null)[] = Array(15).fill(null);

// Modal controls
showHideModal = false;
showUnhideModal = false;
columnToModify: number | null = null;
modalReason = '';
console: any;
  constructor(
    private router: Router,
    private measurementService: MeasurementService,
    private authService: AuthService,
    private alertService : AlertService ,
      private snackBar: MatSnackBar  // ✅ Add this

   ) { }
ngOnInit(): void {
  const fromLocal = localStorage.getItem('measurement_data');
  const state = history.state;
this.tracMin = state.tractionMin ?? null;

  // ✅ Initialize tractionMins with default from state
  const defaultTracMin = state.tractionMin ?? null;

  // ✅ Initialize per-column tractionMin array
this.tractionMins = Array(15).fill(null);
  const userRole = this.authService.getUserRole()?.toLowerCase() || '';
  this.isOperator = userRole === 'operateur';
  this.isQM = userRole === 'qm';
  this.isAdmin = ['admin', 'role_admin'].includes(userRole);
  console.log('isAdmin:', this.isAdmin);

  this.testId = state.savedTestId || state.testId;
  if (!this.testId) {
    alert('❌ No test ID found in navigation state.');
    console.error('Navigation state:', state);
    return this.backToForm();
  }
  console.log('✅ MeasurementTable: Loading data for testId =', this.testId);

  if (this.isOperator) {
    this.userMat = state.operatorMat ?? state.formData?.operatorMat ?? '';
  } else if (this.isQM) {
    this.userMat = state.qmMat ?? state.formData?.qmMat ?? '';
  } else if (this.isAdmin) {
    this.userMat = this.authService.getUserMat();
  } else {
    this.userMat = '';
  }
  console.log('Current userMat:', this.userMat);

  const hasSaved = localStorage.getItem(`saved_${this.testId}_${this.userMat}`);
  if (hasSaved) {
    this.hasSavedThisSession = true;
    this.disableAllInputs();
  }

  this.pelageLimit = state.pelageLimit ?? null;
  this.backupPelageLimit = state.backupPelageLimit ?? null;
  this.rLimit = state.rLimit ?? null;
  this.formData = state.formData;

  this.measurements = Array(this.rows.length + 1).fill(null).map(() => Array(this.columns.length).fill(''));
  this.workingMeasurements = Array(this.rows.length + 1).fill(null).map(() => Array(this.columns.length).fill(''));

  // ✅ Restore from localStorage
  if (fromLocal) {
    try {
      const parsed = JSON.parse(fromLocal);
      if (parsed.testId === this.testId) {
        console.log('Loaded saved data from localStorage for test', this.testId);

        (parsed.measurements ?? []).forEach((row: (string | number)[], r: number) =>
          row.forEach((v: string | number, c: number) => this.measurements[r][c] = v)
        );

        this.means = (parsed.means ?? []).map((m: any) => m === 0 || m == null ? null : +m);
        this.ranges = (parsed.ranges ?? []).map((r: any) => r === 0 || r == null ? null : +r);
        this.columnResults = parsed.columnResults ?? this.columnResults;
        this.columnDates = parsed.columnDates ?? this.columnDates;
        this.hiddenColumns = parsed.hiddenColumns || this.hiddenColumns;
        this.hiddenReasons = parsed.hiddenReasons || this.hiddenReasons;

        // ✅ Restore tractionMins from localStorage
        if (parsed.tractionMins) {
          this.tractionMins = parsed.tractionMins;
        }
      }
    } catch (e) {
      console.error('Failed to parse localStorage data', e);
    }
  }

  this.buildChartConfigs();
  this.loadAllMeasurementsForTest();
}
get rows(): string[] {
  return [
    'Pliage',
    'Distance B, C',
    '1', '2', '3', '4', '5'
  ];
}  ngAfterViewInit(): void {
    setTimeout(() => this.refreshSeries(), 100);
  }
  private buildChartConfigs(): void {
    const labels = this.columns.map((_, i) =>
      this.columnDates[i] !== null ? this.columnDates[i] : `Col ${i + 1}`
    );
    const line = (y: number, txt: string, color: string) => ({
      type: 'line' as const,
      yMin: y,
      yMax: y,
      borderColor: color,
      borderWidth: 2,
      label: {
        display: true,
        content: txt,
        color: '#fff',
        backgroundColor: color,
        position: 'start' as const
      }
    });
    const meanAnno: any[] = [];
    if (this.backupPelageLimit != null)
      meanAnno.push(line(this.backupPelageLimit, `Safe ${this.backupPelageLimit}`, '#28a745'));
    if (this.pelageLimit != null)
      meanAnno.push(line(this.pelageLimit, `Fail ${this.pelageLimit}`, '#ff0000'));
    const rangeAnno: any[] = [];
    if (this.rLimit != null)
      rangeAnno.push(line(this.rLimit, `R-limit ${this.rLimit}`, '#ff0000'));
    this.meanOpts = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Mean (X̄) Chart' },
        annotation: { annotations: meanAnno }
      },
      scales: { y: { beginAtZero: true } }
    };
    this.rangeOpts = {
      responsive: true,
      plugins: {
        title: { display: true, text: 'Range (R) Chart' },
        annotation: { annotations: rangeAnno }
      },
      scales: { y: { beginAtZero: true } }
    };
    this.meanData = {
      labels,
      datasets: [{ data: [], label: 'Mean (X̄)', tension: 0.3, borderColor: '#007bff', fill: false }]
    };
    this.rangeData = {
      labels,
      datasets: [{ data: [], label: 'Range (R)', tension: 0.3, borderColor: '#17a2b8', fill: false }]
    };
  }
isCurrentColumnEditable(c: number): boolean {
  return !this.savedColumns[c] && !this.hasSavedThisSession;
}
private refreshSeries(): void {
  if (!this.meanData || !this.rangeData) return;

  const labels: string[] = [];
  const meanData: (number | null)[] = [];
  const rangeData: (number | null)[] = [];

  // Loop through all columns
  this.columns.forEach((_, c) => {
    // ✅ Skip if column is hidden
    if (this.hiddenColumns[c]) {
      return;
    }

    // Otherwise, include it
    labels.push(this.columnDates[c] !== null ? this.columnDates[c] : `Col ${c + 1}`);
    meanData.push(this.means[c] ?? null);
    rangeData.push(this.ranges[c] ?? null);
  });

  // Update chart data
  this.meanData.labels = labels;
  this.meanData.datasets[0].data = meanData;

  this.rangeData.labels = labels;
  this.rangeData.datasets[0].data = rangeData;

  // Trigger chart update
  if (this.meanChart?.chart) this.meanChart.chart.update('none');
  if (this.rangeChart?.chart) this.rangeChart.chart.update('none');
}
  private hasAnyMeasure() {
    return this.means.some(m => m !== null) || this.ranges.some(r => r !== null);
  }
  isTextRow(r: number): boolean {
    return r <= 2;
  }
calculate(): void {
  // ✅ Operator: reveal all previous raw values
  if (this.isOperator) {
    this.showRawData = true;
    // Now populate all saved raw values (from backend)
    this.measurementService.getAllMeasurementsByTestId(this.testId).subscribe({
      next: (allMeasurements: Measurement[]) => {
        allMeasurements.forEach(m => {
          const c = m.columnIndex;
          if (c < 0 || c >= 15) return;
          m.values.forEach((val: number, idx: number) => {
            this.measurements[idx + 3][c] = val;
          });
        });
      }
    });
  }
  const valuesToAnalyze = this.measurements.slice(3, 8);
  for (let c = 0; c < 15; c++) {
    if (this.savedColumns[c]) continue;
    const colValues: number[] = [];
    for (let r = 0; r < 5; r++) {
      const rawVal = valuesToAnalyze[r][c];
      const val = Number(rawVal);
      if (rawVal !== '' && !isNaN(val)) {
        colValues.push(val);
      }
    }
    if (colValues.length === 5) {
      const mean = +(colValues.reduce((a, b) => a + b, 0) / 5).toFixed(1);
      const range = +(Math.max(...colValues) - Math.min(...colValues)).toFixed(1);
      this.means[c] = +mean;
      this.ranges[c] = +range;
    } else {
      this.means[c] = null;
      this.ranges[c] = null;
    }
  }
  this.updateAllResults();
  this.refreshSeries();
this.showCharts = this.isOperator || this.isQM || this.hasAnyMeasure(); // <-- changed
  this.saveToLocalStorage();
}
private loadAllMeasurementsForTest(): void {
  this.measurementService.getAllMeasurementsByTestId(this.testId).subscribe({
    next: (allMeasurements: Measurement[]) => {
      // Reset
      this.savedColumns = Array(15).fill(false);
      this.columnDates = Array(15).fill(null);
      this.means = Array(15).fill(null);
      this.ranges = Array(15).fill(null);
      this.hiddenColumns = Array(15).fill(false);  // ✅ Reset
      this.hiddenReasons = Array(15).fill(null);    // ✅ Reset

        const savedTractionMin = allMeasurements.find(m => m.tractionMin !== null)?.tractionMin;
      if (savedTractionMin !== undefined && this.tracMin === null) {
        this.tracMin = savedTractionMin;
        console.log('🔁 Restored tractionMin from saved data:', this.tracMin);
      }
      // Populate ALL saved data
 allMeasurements.forEach(m => {
  const c = m.columnIndex;
  if (c < 0 || c >= 15) return;

  this.savedColumns[c] = true;
  this.means[c] = m.mean;
  this.ranges[c] = m.range;

  if (m.savedDate) {
    this.columnDates[c] = new Date(m.savedDate).toISOString().split('T')[0];
  }
  

    if (m.tractionMin !== null && m.tractionMin !== undefined) {
          this.tractionMins[c] = m.tractionMin; // ✅ Now safe
        } else {
          this.tractionMins[c] = null; // ✅ Explicit null
        }

  // ✅ Load hidden status from backend
  if (m.hiddenColumn) {
    this.hiddenColumns[c] = true;
    this.hiddenReasons[c] = m.hiddenColumn.hideReason;
  }

  if (!this.isOperator) {
    m.values.forEach((val: number, idx: number) => {
      this.measurements[idx + 3][c] = val;
    });
  }
  console.log('Final hiddenColumns after load:', this.hiddenColumns);
allMeasurements.forEach(m => {
  console.log(`Measurement ${m.columnIndex} - hiddenColumn:`, m.hiddenColumn);
});
});      console.log('✅ Restored tractionMins:', this.tractionMins);

      this.buildChartConfigs();

      this.showRawData = !this.isOperator || this.isQM;
      this.updateAllResults();
      this.refreshSeries();
this.showCharts = this.isOperator || this.isQM || this.hasAnyMeasure(); // <-- changed
      this.saveToLocalStorage();
    },
    error: (err) => {
      console.error('Failed to load ALL measurements', err);
    }
  });
}

private evaluateColumn(c: number): 'PASS' | 'ALERT' | 'FAIL' {
  const mean = this.means[c];
  const range = this.ranges[c];
  // ❌ FAIL: Out of limits
  if (
    (mean !== null && this.pelageLimit !== null && mean > this.pelageLimit) ||
    (range !== null && this.rLimit !== null && range > this.rLimit)
  ) {
    if (!this.savedColumns[c]) {
      this.triggerAdminAlert(c);
    }
    return 'FAIL';
  }
  // ⚠️ ALERT: 4+ successive values with abnormally low variation
  const MAX_HISTORY = 15;
  const start = Math.max(0, c - MAX_HISTORY);
  const recentMeans = this.means.slice(start, c + 1).filter(m => m !== null) as number[];
  const recentRanges = this.ranges.slice(start, c + 1).filter(r => r !== null) as number[];
  if (this.hasAlertPattern(recentMeans) && this.hasAlertPattern(recentRanges)) {
    return 'ALERT';
  }
  return 'PASS';
}
onInput(event: Event, r: number, c: number): void {
  if (this.savedColumns[c] || this.hasSavedThisSession) {
    return;
  }
  const input = event.target as HTMLInputElement;
  const value: string | number = this.isTextRow(r)
    ? input.value
    : +input.value;
  this.measurements[r][c] = value;
}
getTooltip(result: string): string {
  switch (result) {
    case 'PASS':
      return 'All values within control limits. Machine is stable.';
    case 'ALERT':
      return ' Possible measurement or process issue.';
    case 'FAIL':
      return 'Mean or Range exceeds the limit. Machine may be out of control.';
    default:
      return '';
  }
}
private hasAlertPattern(values: number[]): boolean {
   if (values.length < 5) return false;
  // Check every group of 4 consecutive values
  for (let i = 3; i < values.length; i++) {
    const window = values.slice(i - 3, i + 1); // [i-3, i-2, i-1, i]
    const min = Math.min(...window);
    const max = Math.max(...window);
    const range = max - min;
    const mean = window.reduce((a, b) => a + b, 0) / 4;
    // ✅ Define "too close" — adjust thresholds based on your process
    const MAX_ALLOWED_RANGE = 1.5;  // Max spread in 4 values
    const MIN_EXPECTED_RANGE = 0.8; // Min expected natural variation
    const COEFFICIENT_OF_VARIATION_THRESHOLD = 0.05; // 5% CV = very low variation
    // Option 1: Absolute range too small
    if (range < MIN_EXPECTED_RANGE) {
      console.log(`⚠️ Low variation alert: values [${window.join(', ')}] have range = ${range.toFixed(2)}`);
      return true;
    }
    const stdDev = Math.sqrt(
      window.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / 4
    );
    const cv = stdDev / mean; // Coefficient of Variation
    if (cv < COEFFICIENT_OF_VARIATION_THRESHOLD && range < MAX_ALLOWED_RANGE) {
      console.log(`⚠️ Low variation alert: values [${window.join(', ')}] have CV = ${cv.toFixed(3)}`);
      return true;
    }
  }
  return false;
}
private updateAllResults(): void {
  this.columnResults = this.columns.map((_, c) => this.evaluateColumn(c));
}
  private saveToLocalStorage(): void {
    localStorage.setItem('measurement_data', JSON.stringify({
      testId: this.testId,
      formData: this.formData,
      measurements: this.measurements,
      means: this.means,
      ranges: this.ranges,
      columnResults: this.columnResults,
      columnDates: this.columnDates,
          hiddenColumns: this.hiddenColumns,   // ✅ Add this
    hiddenReasons: this.hiddenReasons ,
        tractionMins: this.tractionMins  // ✅ Add this

    }));
  }
  getColumnValues(columnIndex: number): number[] {
    const colValues: number[] = [];
    for (let r = 3; r <= 7; r++) {
      const val = Number(this.measurements[r][columnIndex]);
      if (!isNaN(val) && val !== null && val !== undefined) {
        colValues.push(val);
      }
    }
    return colValues;
  }
  getSaveButtonLabel(): string {
    for (let c = 0; c < 15; c++) {
      if (!this.savedColumns[c] && this.getColumnValues(c).length === 5) {
        return 'Save';
      }
    }
    return 'No valid column to save';
  }
  canSave(): boolean {
    return this.getSaveButtonLabel() === 'Save';
  }
saveToDatabase(): void {
  if (!this.testId) {
    alert('Test ID missing');
    return;
  }
  const savedKey = this.isOperator 
    ? `saved_${this.testId}_operator_${this.userMat}`
    : this.isQM 
      ? `saved_${this.testId}_qm_${this.userMat}`
      : `saved_${this.testId}_${this.userMat}`;
  const hasSaved = localStorage.getItem(savedKey);
  if (hasSaved) {
    alert('You have already saved a column for this test. Cannot save again.');
    return;
  }
  const columnToSave = this.columns.find(c =>
    !this.savedColumns[c] && this.getColumnValues(c).length === 5
  );
  
  if (columnToSave === undefined) {
    alert('No valid unsaved column with 5 values found.');
    return;
  }
  const rawValues = this.getColumnValues(columnToSave);
  const mean = +(rawValues.reduce((a, b) => a + b, 0) / 5).toFixed(1);
  const range = +(Math.max(...rawValues) - Math.min(...rawValues)).toFixed(1);
    console.log('Saving with tractionMin:', this.tracMin); // ✅ Add this

  const payload = {
  testId: this.testId,
  columnIndex: columnToSave,
  values: rawValues,
  mean: mean,
  range: range,
  operatorMat: this.isOperator ? this.userMat : null,
  qmMat: this.isQM ? this.userMat : null,  
  tractionMin: this.tractionMins[columnToSave]  // ✅ Column-specific

};    console.log('📤 Final payload:', payload);


  this.measurementService.saveMeasurement(payload).subscribe({
    next: () => {
      this.savedColumns[columnToSave] = true;
      this.columnDates[columnToSave] = new Date().toISOString().split('T')[0];
      localStorage.setItem(savedKey, 'true');
      this.updateAllResults();
      this.refreshSeries();
      this.saveToLocalStorage();
      this.disableAllInputs();
      alert(`✅ Column ${columnToSave + 1} saved successfully! You cannot save again in this session.`);
    },
    error: (err) => {
      console.error('Failed to save measurement', err);
      alert('❌ Error saving measurement');
    }
  });
}
calculateAndSave(): void {
  this.calculate(); // Calculates means/ranges
  this.refreshSeries(); // Force chart redraw
  this.showCharts = true; // Ensure charts are visible to everyone

  if (this.canSave() && !this.hasSavedThisSession) {
    this.saveToDatabase();
  }
}
onTractionMinInput(event: Event, c: number): void {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  this.tractionMins[c] = value ? +value : null;
  console.log(`Traction Min for column ${c} updated:`, this.tractionMins[c]);
}
private disableAllInputs(): void {
  const inputs = document.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
  inputs.forEach(input => {
    input.disabled = true;
  });
  const table = document.querySelector('.large-table') as HTMLElement;
  if (table) {
    table.style.opacity = '0.7';
    table.style.pointerEvents = 'none';
  }
}
private triggerAdminAlert(columnIndex: number): void {
  const testFailure = {
    testId: this.testId,
      operatorMat: this.userMat,  // changed here for alerting
    machineNumber: this.formData?.machineNumber, // from launch-test
    segment: this.formData?.segment,
    plantSiteName: this.formData?.plantSiteName,
    mean: this.means[columnIndex],
    range: this.ranges[columnIndex],
    pelageLimit: this.pelageLimit,
    rLimit: this.rLimit,
    savedDate: new Date().toISOString(),
    status: 'FAIL'
  };
  this.alertService.sendTestFailureAlert(testFailure).subscribe({
    next: () => console.log('Admin alerted successfully'),
    error: (err) => console.error('Failed to send alert', err)
  });
}
openHideModal(columnIndex: number): void {
  console.log('openHideModal called with column:', columnIndex);
  this.columnToModify = columnIndex;
  this.modalReason = '';
  this.showHideModal = true;
}
confirmHide(): void {
  if (this.columnToModify === null || !this.modalReason.trim()) {
    alert('Please enter a reason for hiding the column.');
    return;
  }

  const c = this.columnToModify;
  const reason = this.modalReason.trim();

  this.measurementService.hideColumn(this.testId, c, reason, this.userMat).subscribe({
    next: (response: any) => {
      this.hiddenColumns[c] = true;
      this.hiddenReasons[c] = reason;
      this.showHideModal = false;
      this.columnToModify = null;
      this.modalReason = '';
      this.snackBar.open(`Column ${c + 1} hidden successfully.`, 'Close', { duration: 3000 });
      this.refreshSeries(); // Update charts
      this.saveToLocalStorage(); // Persist UI state
    },
    error: (err: any) => {
      console.error('Failed to hide column', err);
      this.snackBar.open('Failed to hide column.', 'Close', { duration: 3000 });
    }
  });
}

openUnhideModal(columnIndex: number): void {
    console.log('openUnhideModal called with', columnIndex);

  this.columnToModify = columnIndex;
  this.showUnhideModal = true;
  this.showHideModal = false;
}
confirmUnhide(): void {
  if (this.columnToModify === null) return;
  const c = this.columnToModify;

  this.measurementService.unhideColumn(this.testId, c, this.userMat).subscribe({
    next: () => {
      console.log('✅ Unhide successful');

      // ✅ Wait longer to ensure DB commit
      setTimeout(() => {
        this.loadAllMeasurementsForTest();
      }, 800); // 800ms delay

      this.showUnhideModal = false;
      this.columnToModify = null;

      this.snackBar.open(`Column ${c + 1} unhidden successfully.`, 'Close', { duration: 3000 });
    },
    error: (err: any) => {
      console.error('❌ Failed to unhide column', err);
      this.snackBar.open('Failed to unhide column.', 'Close', { duration: 3000 });
    }
  });
}
cancelModal(): void {
  this.showHideModal = false;
  this.showUnhideModal = false;
  this.columnToModify = null;
  this.modalReason = '';
}
exportToPDF(): void {
  const element = document.querySelector('.measurement-table-container') as HTMLElement;
  if (!element) {
    console.error('Measurement table container not found');
    return;
  }
  const pdfBtn = document.querySelector('.btn-pdf') as HTMLElement;
  if (pdfBtn) pdfBtn.style.display = 'none';
  html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff', // ✅ Fixed: was 'background'
    logging: false
  })
  .then((canvas: HTMLCanvasElement) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`measurement-report-test-${this.testId}.pdf`);
    if (pdfBtn) pdfBtn.style.display = 'block';
  })
  .catch((err: any) => {
    console.error('Error generating PDF:', err);
    alert('❌ Failed to generate PDF. Check console for details.');
    if (pdfBtn) pdfBtn.style.display = 'block';
  });
}
  backToForm(): void {
  this.router.navigate(['/admin/testHistory']);
}
backToHistory(): void {
  this.router.navigate(['/admin/testHistory']);
}}