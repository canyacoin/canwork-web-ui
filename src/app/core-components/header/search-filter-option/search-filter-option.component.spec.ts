import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { SearchFilterOptionComponent } from './search-filter-option.component'

describe('SearchFilterOptionComponent', () => {
  let component: SearchFilterOptionComponent
  let fixture: ComponentFixture<SearchFilterOptionComponent>

  beforeEach(async(() => {
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
