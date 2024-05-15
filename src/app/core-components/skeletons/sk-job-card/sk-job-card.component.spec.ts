import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkJobCardComponent } from './sk-job-card.component';

describe('SkJobCardComponent', () => {
  let component: SkJobCardComponent;
  let fixture: ComponentFixture<SkJobCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkJobCardComponent]
    });
    fixture = TestBed.createComponent(SkJobCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
