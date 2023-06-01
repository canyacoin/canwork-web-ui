import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { SupportMeComponent } from './support-me.component'

describe('SupportMeComponent', () => {
  let component: SupportMeComponent
  let fixture: ComponentFixture<SupportMeComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SupportMeComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportMeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
