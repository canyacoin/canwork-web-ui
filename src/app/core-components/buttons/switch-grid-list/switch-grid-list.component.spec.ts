import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwitchGridListComponent } from './switch-grid-list.component';

describe('SwitchGridListComponent', () => {
  let component: SwitchGridListComponent;
  let fixture: ComponentFixture<SwitchGridListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwitchGridListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SwitchGridListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
