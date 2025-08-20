export interface Measurement {
  id: number;
  operatorMat: string;
  testId: number;
  columnIndex: number;
  values: number[];
  mean: number;
  range: number;
    savedDate: string;
 hiddenColumn?: {
    hideReason: string;
    hiddenBy: string;
    hiddenAt: string;
  } | null;
tractionMin: number | null; // ✅ Not optional — use `null` instead of `undefined`
}  
