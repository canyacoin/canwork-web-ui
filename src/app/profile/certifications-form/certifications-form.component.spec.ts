import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificationsFormComponent } from './certifications-form.component';

describe('CertificationsFormComponent', () => {
  let component: CertificationsFormComponent;
  let fixture: ComponentFixture<CertificationsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificationsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
