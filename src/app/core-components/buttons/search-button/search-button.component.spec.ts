import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchButtonComponent } from './search-button.component';

describe('SearchButtonComponent', () => {
  let component: SearchButtonComponent;
  let fixture: ComponentFixture<SearchButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchButtonComponent]
    });
    fixture = TestBed.createComponent(SearchButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
