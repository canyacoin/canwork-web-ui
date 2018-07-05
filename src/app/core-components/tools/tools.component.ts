import { Component, OnInit } from '@angular/core';

declare var createHelperCards: any;

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
    createHelperCards();
  }
}
