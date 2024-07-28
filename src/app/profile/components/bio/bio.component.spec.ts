import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BioComponent } from './bio.component'

describe('BioComponent', () => {
  let component: BioComponent
  let fixture: ComponentFixture<BioComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [BioComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BioComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
