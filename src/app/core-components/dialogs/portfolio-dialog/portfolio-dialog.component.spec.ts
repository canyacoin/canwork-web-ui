import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortfolioDialogComponent } from './portfolio-dialog.component';

describe('PortfolioDialogComponent', () => {
  let component: PortfolioDialogComponent;
  let fixture: ComponentFixture<PortfolioDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PortfolioDialogComponent]
    });
    fixture = TestBed.createComponent(PortfolioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
