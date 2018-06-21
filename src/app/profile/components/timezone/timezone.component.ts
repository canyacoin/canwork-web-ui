import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs/observable/interval';
import { Subscription } from 'rxjs/Subscription';

import { User, UserType } from '../../../core-classes/user';

@Component({
  selector: 'app-profile-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.css']
})
export class TimezoneComponent implements OnInit, OnDestroy {

  @Input() userModel: User;

  myInterval = interval(1000);
  localTime: string;

  timeSub: Subscription;

  constructor() { }

  ngOnInit() {
    this.timeSub = this.myInterval.subscribe(x => {
      this.localTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    });
  }

  isProvider() {
    if (this.userModel == null) {
      return false;
    }
    return this.userModel.type === UserType.provider;
  }

  ngOnDestroy() {
    if (this.timeSub) { this.timeSub.unsubscribe(); }
  }
}

