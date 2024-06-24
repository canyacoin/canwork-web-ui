import { Component, Input, OnInit, Directive } from '@angular/core'

@Component({
  selector: 'app-skill-tag',
  templateUrl: './skill-tag.component.html',
})
export class SkillTagComponent implements OnInit {
  @Input() skill: string
  @Input() cancel?: boolean

  constructor() {}

  ngOnInit() {}
}
