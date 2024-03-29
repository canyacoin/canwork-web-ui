import { Component, Input, OnDestroy, OnInit, Directive } from '@angular/core'
import { Observable, interval, Subscription } from 'rxjs'

import { User, UserType } from '../../../core-classes/user'

@Component({
  selector: 'app-profile-timezone',
  templateUrl: './timezone.component.html',
  styleUrls: ['./timezone.component.css'],
})
export class TimezoneComponent implements OnInit, OnDestroy {
  @Input() userModel: User

  myInterval = interval(1000)
  localTime: string

  timeSub: Subscription

  constructor() {}

  ngOnInit() {
    this.timeSub = this.myInterval.subscribe((x) => {
      this.localTime = new Date().toLocaleString('en-US', {
        timeZone: this.userModel.timezone || 'America/New_York',
      })
    })
  }

  isProvider() {
    if (this.userModel == null) {
      return false
    }
    return this.userModel.type === UserType.provider
  }

  ngOnDestroy() {
    if (this.timeSub) {
      this.timeSub.unsubscribe()
    }
  }
}
