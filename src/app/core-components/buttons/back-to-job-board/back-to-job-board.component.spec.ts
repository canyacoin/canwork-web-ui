import { ComponentFixture, TestBed } from '@angular/core/testing'

import { BackToJobBoardComponent } from './back-to-job-board.component'

describe('BackToJobBoardComponent', () => {
  let component: BackToJobBoardComponent
  let fixture: ComponentFixture<BackToJobBoardComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BackToJobBoardComponent],
    })
    fixture = TestBed.createComponent(BackToJobBoardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
