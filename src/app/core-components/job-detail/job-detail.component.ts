import { Component, Input} from '@angular/core';

@Component({
  selector: 'job-detail-panel',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent {
  @Input() job: any
  @Input() jobFromNow: string
  @Input() canSee: boolean
}
