import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhoBehindComponent } from './who-behind.component';

describe('WhoBehindComponent', () => {
  let component: WhoBehindComponent;
  let fixture: ComponentFixture<WhoBehindComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhoBehindComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WhoBehindComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
