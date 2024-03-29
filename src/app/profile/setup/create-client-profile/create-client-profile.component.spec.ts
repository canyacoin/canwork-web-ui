import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CreateClientProfileComponent } from './create-client-profile.component'

describe('CreateClientProfileComponent', () => {
  let component: CreateClientProfileComponent
  let fixture: ComponentFixture<CreateClientProfileComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateClientProfileComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateClientProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
