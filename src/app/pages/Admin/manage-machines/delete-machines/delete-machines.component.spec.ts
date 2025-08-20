import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteMachinesComponent } from './delete-machines.component';

describe('DeleteMachinesComponent', () => {
  let component: DeleteMachinesComponent;
  let fixture: ComponentFixture<DeleteMachinesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DeleteMachinesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteMachinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
