import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseFreelancersComponent } from './browse-freelancers.component';

describe('BrowseFreelancersComponent', () => {
  let component: BrowseFreelancersComponent;
  let fixture: ComponentFixture<BrowseFreelancersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrowseFreelancersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseFreelancersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
