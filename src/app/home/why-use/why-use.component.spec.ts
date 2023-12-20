import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyUseComponent } from './why-use.component';

describe('WhyUseComponent', () => {
  let component: WhyUseComponent;
  let fixture: ComponentFixture<WhyUseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhyUseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhyUseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
