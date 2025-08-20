import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QmComponent } from './qm.component';

describe('QmComponent', () => {
  let component: QmComponent;
  let fixture: ComponentFixture<QmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
