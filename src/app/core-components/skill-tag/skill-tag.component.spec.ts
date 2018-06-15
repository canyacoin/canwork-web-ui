import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTagComponent } from './skill-tag.component';

describe('SkillTagComponent', () => {
  let component: SkillTagComponent;
  let fixture: ComponentFixture<SkillTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SkillTagComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
