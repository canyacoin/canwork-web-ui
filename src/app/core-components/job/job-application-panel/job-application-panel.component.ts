import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
} from '@angular/core'
import { formatDateFromString } from 'app/core-functions/date'
import { Bid } from '@class/job'

import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'job-application-panel',
  templateUrl: './job-application-panel.component.html',
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
export class JobApplicationPanelComponent implements AfterViewInit {
  @ViewChild('contentDiv') contentDiv: ElementRef
  @Input() yourApplication!: Bid
  @Input() isHired: boolean = false
  @Output() btnEvent = new EventEmitter<Event>()
  // core-functions
  formatDateFromString = formatDateFromString

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

  withdrawButtonClick(event: Event) {
    event.preventDefault()
    this.btnEvent.emit(event)
  }
}
