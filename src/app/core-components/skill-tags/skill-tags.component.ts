import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-skill-tags',
  templateUrl: './skill-tags.component.html',
  styleUrls: ['./skill-tags.component.css']
})
export class SkillTagsComponent implements OnInit {

  @Input() skills: Array<string>;

  constructor() { }

  ngOnInit() { }

}
