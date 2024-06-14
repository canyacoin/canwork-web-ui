import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BasicDialogComponent } from './basic-dialog.component'

describe('BasicDialogComponent', () => {
  let component: BasicDialogComponent
  let fixture: ComponentFixture<BasicDialogComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BasicDialogComponent],
    })
    fixture = TestBed.createComponent(BasicDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
