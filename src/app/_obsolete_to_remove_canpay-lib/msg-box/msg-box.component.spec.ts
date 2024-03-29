import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { MsgBoxComponent } from './msg-box.component'

describe('MsgBoxComponent', () => {
  let component: MsgBoxComponent
  let fixture: ComponentFixture<MsgBoxComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MsgBoxComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(MsgBoxComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
