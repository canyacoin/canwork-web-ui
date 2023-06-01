import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { SearchFilterOptionComponent } from './search-filter-option.component'

describe('SearchFilterOptionComponent', () => {
  let component: SearchFilterOptionComponent
  let fixture: ComponentFixture<SearchFilterOptionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SearchFilterOptionComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchFilterOptionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
