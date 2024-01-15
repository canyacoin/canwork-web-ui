import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkProfileCardComponent } from './sk-profile-card.component';

describe('SkProfileCardComponent', () => {
  let component: SkProfileCardComponent;
  let fixture: ComponentFixture<SkProfileCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SkProfileCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkProfileCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
