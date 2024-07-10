import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core'
import { User, UserType } from '@class/user'
import { Job } from '@class/job'
import { IJobAction } from '@class/job-action'

import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'job-action-log-panel',
  templateUrl: './job-action-log-panel.component.html',
  animations: [
    trigger('toggleHeight', [
      state(
        'collapsed',
        style({
          height: '260px',
          overflow: 'hidden',
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
        })
      ),
      transition('collapsed <=> expanded', [animate('150ms')]),
    ]),
  ],
})
export class JobActionLogPanelComponent implements AfterViewInit {
  @ViewChild('contentDiv') contentDiv: ElementRef
  @Input() job!: Job
  @Input() currentUser!: User
  @Input() isTabMode: boolean = false
  currentUserType: UserType
  parsedActionLog

  isSeeMore: boolean = false
  isHeightMoreThan259px: boolean = false

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.checkHeight()
  }

  checkHeight() {
    if (this.contentDiv) {
      const height = this.contentDiv.nativeElement.offsetHeight
      this.isHeightMoreThan259px = height > 259
    }
  }

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
