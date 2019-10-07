import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { CreateProviderProfileComponent } from './create-provider-profile.component'

describe('CreateProviderProfileComponent', () => {
  let component: CreateProviderProfileComponent
  let fixture: ComponentFixture<CreateProviderProfileComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateProviderProfileComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProviderProfileComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
