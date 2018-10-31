import { Component, Input } from '@angular/core';

import { Job, JobState, PaymentType } from '../../../../core-classes/job';
import { User, UserType } from '../../../../core-classes/user';

@Component({
  selector: 'app-status-icon',
  templateUrl: './status-icon.component.html',
  styleUrls: ['./status-icon.component.css']
})
export class StatusIconComponent {

  @Input() job: Job;
  @Input() currentUserType: UserType;

  constructor() { }
}
