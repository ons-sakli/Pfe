import { Machine } from './machine.model';
import { Measurement } from './measurement.model';
import { Operateur } from './operateur.model';
import { WireSection } from './wireSection.model';

export interface Test {
  testId: number;
  dateTest: string;
  result: string;
  machine: Machine;
  operateur: Operateur;
  wire: WireSection;
  measurement: Measurement | null;
}