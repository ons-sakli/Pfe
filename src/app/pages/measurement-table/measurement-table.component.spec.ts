import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeasurementTableComponent } from './measurement-table.component';

describe('MeasurementTableComponent', () => {
  let component: MeasurementTableComponent;
  let fixture: ComponentFixture<MeasurementTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeasurementTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeasurementTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
