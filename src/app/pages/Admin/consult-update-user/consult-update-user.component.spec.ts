import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultUpdateUserComponent } from './consult-update-user.component';

describe('ConsultUpdateUserComponent', () => {
  let component: ConsultUpdateUserComponent;
  let fixture: ComponentFixture<ConsultUpdateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultUpdateUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultUpdateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
