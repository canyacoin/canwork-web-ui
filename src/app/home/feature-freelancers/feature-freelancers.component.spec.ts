import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFreelancersComponent } from './feature-freelancers.component';

describe('FeatureFreelancersComponent', () => {
  let component: FeatureFreelancersComponent;
  let fixture: ComponentFixture<FeatureFreelancersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeatureFreelancersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeatureFreelancersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
