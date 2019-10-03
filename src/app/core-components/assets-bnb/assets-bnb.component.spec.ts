import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsBnbComponent } from './assets-bnb.component';

describe('AssetsBnbComponent', () => {
  let component: AssetsBnbComponent;
  let fixture: ComponentFixture<AssetsBnbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetsBnbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsBnbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
