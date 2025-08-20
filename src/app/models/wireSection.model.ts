// src/app/models/wireSection.model.ts
export interface WireSection {
  id: number;
  section: string;
  pelageLimit: number | null;  
  rlimit: number | null;       
  tracMin: number | null;      
}