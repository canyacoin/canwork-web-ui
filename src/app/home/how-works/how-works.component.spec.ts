import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowWorksComponent } from './how-works.component';

describe('HowWorksComponent', () => {
  let component: HowWorksComponent;
  let fixture: ComponentFixture<HowWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowWorksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
