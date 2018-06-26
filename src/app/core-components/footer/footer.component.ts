import { Component, OnInit } from '@angular/core';

declare var createFooter: any;
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    createFooter();
  }

}
