import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { StorageDropzoneComponent } from './storage-dropzone.component'

describe('StorageDropzoneComponent', () => {
  let component: StorageDropzoneComponent
  let fixture: ComponentFixture<StorageDropzoneComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StorageDropzoneComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(StorageDropzoneComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
