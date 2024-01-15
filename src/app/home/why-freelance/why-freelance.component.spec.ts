import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyFreelanceComponent } from './why-freelance.component';

describe('WhyFreelanceComponent', () => {
  let component: WhyFreelanceComponent;
  let fixture: ComponentFixture<WhyFreelanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhyFreelanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyFreelanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
