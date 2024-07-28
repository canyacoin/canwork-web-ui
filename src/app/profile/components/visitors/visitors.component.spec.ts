import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { VisitorsComponent } from './visitors.component'

describe('VisitorsComponent', () => {
  let component: VisitorsComponent
  let fixture: ComponentFixture<VisitorsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VisitorsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitorsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
