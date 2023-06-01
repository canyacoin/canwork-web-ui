import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ProfileViewsComponent } from './profile-views.component'

describe('ProfileViewsComponent', () => {
  let component: ProfileViewsComponent
  let fixture: ComponentFixture<ProfileViewsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileViewsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileViewsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
