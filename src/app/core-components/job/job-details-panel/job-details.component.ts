import { Component, Input } from '@angular/core'
import { Job } from '@class/job'
import * as moment from 'moment'

@Component({
  selector: 'job-details-panel',
  templateUrl: './job-details.component.html',
})
export class JobDetailsPanelComponent {
  @Input() job!: Job
  @Input() isJobDetailsShow: boolean = false
  jobFromNow: string

  ngOnInit() {
    if (this.job) this.jobFromNow = moment(this.job.createAt).fromNow()
  }
}
