import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultUpdateMachinesComponent } from './consult-update-machines.component';

describe('ConsultUpdateMachinesComponent', () => {
  let component: ConsultUpdateMachinesComponent;
  let fixture: ComponentFixture<ConsultUpdateMachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultUpdateMachinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultUpdateMachinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
