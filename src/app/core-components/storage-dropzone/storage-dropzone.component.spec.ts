import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { StorageDropzoneComponent } from './storage-dropzone.component'

describe('StorageDropzoneComponent', () => {
  let component: StorageDropzoneComponent
  let fixture: ComponentFixture<StorageDropzoneComponent>

  beforeEach(async(() => {
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
