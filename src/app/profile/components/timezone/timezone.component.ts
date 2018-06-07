import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';

@Component({
  selector: 'app-profile-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.css']
})
export class TimezoneComponent implements OnInit {

  @Input() userModel: any;

  myInterval = interval(1000);
  localTime: string;

  constructor() { }

  ngOnInit() {
    this.myInterval.subscribe(x => {
      this.localTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    });
  }
}

