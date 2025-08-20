export interface Segment {
  id: number;
  segmentName: string;
  plantSiteName: string; // optional, for display/filtering purposes
}
export interface Machine {
  nrMachine: string;
  type: string;
  client: string;
 plantSiteName: string; 
segment: Segment;
  active: boolean;  // ✅ add this
}
