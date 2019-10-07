import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { IpfsDropzoneComponent } from './ipfs-dropzone.component'

describe('IpfsDropzoneComponent', () => {
  let component: IpfsDropzoneComponent
  let fixture: ComponentFixture<IpfsDropzoneComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IpfsDropzoneComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IpfsDropzoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
