import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { WithDockComponent } from './with-dock.component'

describe('WithDockComponent', () => {
  let component: WithDockComponent
  let fixture: ComponentFixture<WithDockComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WithDockComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(WithDockComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
