import { Component, Input } from '@angular/core'
import { User, UserType } from '@class/user'
import { Job } from '@class/job'
import { IJobAction } from '@class/job-action'

@Component({
  selector: 'job-action-log-panel',
  templateUrl: './job-action-log-panel.component.html',
})
export class JobActionLogPanelComponent {
  @Input() job!: Job
  @Input() currentUser!: User
  @Input() isAwaitingEscrow: boolean = false
  currentUserType: UserType
  parsedActionLog

  ngOnInit() {
    this.parsedActionLog = this.job.parsedActionLog.sort(
      (a, b) => a.timestamp - b.timestamp
    )
    this.currentUserType =
      this.currentUser.address === this.job.clientId
        ? UserType.client
        : UserType.provider
  }

  getActionExecutor(action: IJobAction) {
    return action.executedBy === this.currentUserType
      ? 'You'
      : this.job['otherParty']
      ? this.job['otherParty'].name
      : ''
  }
}
