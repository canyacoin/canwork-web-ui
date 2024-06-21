import { Component, Output, EventEmitter, Input } from '@angular/core'
import { formatDateFromString } from 'app/core-functions/date'
import { Bid } from '@class/job'

@Component({
  selector: 'job-application-panel',
  templateUrl: './job-application-panel.component.html',
})
export class JobApplicationPanelComponent {
  @Input() yourApplication!: Bid
  @Output() btnEvent = new EventEmitter<Event>()
  // core-functions
  formatDateFromString = formatDateFromString

  withdrawButtonClick(event: Event) {
    this.btnEvent.emit(event)
  }
}
