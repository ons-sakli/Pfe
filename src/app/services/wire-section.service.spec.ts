import { TestBed } from '@angular/core/testing';

import { WireSectionService } from './wire-section.service';

describe('WireSectionService', () => {
  let service: WireSectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WireSectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
