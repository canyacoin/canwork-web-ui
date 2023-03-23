import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BotComponent } from './bot.component'

describe('BotComponent', () => {
  let component: BotComponent
  let fixture: ComponentFixture<BotComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BotComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BotComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
