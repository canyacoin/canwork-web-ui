import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core'
import { Job } from '@class/job'
import * as moment from 'moment'

import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'job-details-panel',
  templateUrl: './job-details-panel.component.html',
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
export class JobDetailsPanelComponent implements AfterViewInit {
  @ViewChild('contentDiv') contentDiv: ElementRef
  @Input() job!: Job
  @Input() isJobDetailsShow: boolean = false
  jobFromNow: string

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
    if (this.job) this.jobFromNow = moment(this.job.createAt).fromNow()
  }
}
