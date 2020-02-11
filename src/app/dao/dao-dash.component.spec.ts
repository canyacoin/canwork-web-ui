import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DAODashComponent } from './dao-dash.component'

describe('DAODashComponent', () => {
  let component: DAODashComponent
  let fixture: ComponentFixture<DAODashComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DAODashComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DAODashComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
