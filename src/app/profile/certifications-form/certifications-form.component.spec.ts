import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CertificationsFormComponent } from './certifications-form.component'

describe('CertificationsFormComponent', () => {
  let component: CertificationsFormComponent
  let fixture: ComponentFixture<CertificationsFormComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CertificationsFormComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificationsFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
