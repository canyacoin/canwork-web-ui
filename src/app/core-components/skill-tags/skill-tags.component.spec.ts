import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTagsComponent } from './skill-tags.component';

describe('SkillTagsComponent', () => {
  let component: SkillTagsComponent;
  let fixture: ComponentFixture<SkillTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SkillTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
