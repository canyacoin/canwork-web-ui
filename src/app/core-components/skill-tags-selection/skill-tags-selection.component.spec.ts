import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { SkillTagsSelectionComponent } from './skill-tags-selection.component'

describe('SkillTagsSelectionComponent', () => {
  let component: SkillTagsSelectionComponent
  let fixture: ComponentFixture<SkillTagsSelectionComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SkillTagsSelectionComponent],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillTagsSelectionComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
