import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePostCardComponent } from './share-post-card.component';

describe('SharePostCardComponent', () => {
  let component: SharePostCardComponent;
  let fixture: ComponentFixture<SharePostCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SharePostCardComponent]
    });
    fixture = TestBed.createComponent(SharePostCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
