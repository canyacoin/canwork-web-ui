import { Component, Input, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-skill-tag',
  templateUrl: './skill-tag.component.html',
  styleUrls: ['./skill-tag.component.css'],
})
export class SkillTagComponent implements OnInit {
  @Input() skill: string

  constructor() {}

  ngOnInit() {}
}
