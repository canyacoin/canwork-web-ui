import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ProviderStateComponent } from './provider-state.component'

describe('ProviderStateComponent', () => {
  let component: ProviderStateComponent
  let fixture: ComponentFixture<ProviderStateComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderStateComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderStateComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
