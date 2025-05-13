import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaunchTestComponent } from './launch-test.component';

describe('LaunchTestComponent', () => {
  let component: LaunchTestComponent;
  let fixture: ComponentFixture<LaunchTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LaunchTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LaunchTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
