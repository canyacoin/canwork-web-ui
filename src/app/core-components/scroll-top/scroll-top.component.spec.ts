import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ScrollTopComponent } from './scroll-top.component'

describe('ScrollTopComponent', () => {
  let component: ScrollTopComponent
  let fixture: ComponentFixture<ScrollTopComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ScrollTopComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollTopComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
