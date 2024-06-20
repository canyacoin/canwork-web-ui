import { Component, Input } from '@angular/core'

@Component({
  selector: 'job-details-panel',
  templateUrl: './job-details.component.html',
})
export class JobDetailsComponent {
  @Input() job: any
  @Input() jobFromNow: string
  @Input() canSee: boolean
}
