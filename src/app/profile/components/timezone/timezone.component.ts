import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-profile-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.css']
})
export class TimezoneComponent implements OnInit, OnDestroy {

  @Input() userModel: any;

  myInterval = interval(1000);
  localTime: string;

  timeSub: Subscription;

  constructor() { }

  ngOnInit() {
    this.timeSub = this.myInterval.subscribe(x => {
      this.localTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    });
  }

  ngOnDestroy() {
    if (this.timeSub) { this.timeSub.unsubscribe(); }
  }
}

