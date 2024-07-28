import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CertificationsComponent } from './certifications.component'

describe('CertificationsComponent', () => {
  let component: CertificationsComponent
  let fixture: ComponentFixture<CertificationsComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationsComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
