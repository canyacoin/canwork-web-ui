import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinCommunityComponent } from './join-community.component';

describe('JoinCommunityComponent', () => {
  let component: JoinCommunityComponent;
  let fixture: ComponentFixture<JoinCommunityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinCommunityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
