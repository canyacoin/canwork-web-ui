import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkCertificationComponent } from './sk-certification.component';

describe('SkCertificationComponent', () => {
  let component: SkCertificationComponent;
  let fixture: ComponentFixture<SkCertificationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SkCertificationComponent]
    });
    fixture = TestBed.createComponent(SkCertificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
