import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { Bid } from '@class/job'

import { trigger, state, style, transition, animate } from '@angular/animations'

@Component({
  selector: 'job-freelancer-information-panel',
  templateUrl: './job-freelancer-information-panel.component.html',
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
export class JobFreelancerInformationPanelComponent
  implements AfterViewInit, OnChanges
{
  @ViewChild('contentDiv') contentDiv: ElementRef
  @Input() selectedBid!: Bid

  isSeeMore: boolean = false
  isHeightMoreThan259px: boolean = false

  constructor() {}

  ngAfterViewInit() {
    this.checkHeight()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedBid && !changes.selectedBid.firstChange) {
      this.checkHeight()
    }
  }

  checkHeight() {
    if (this.contentDiv) {
      const height = this.contentDiv.nativeElement.offsetHeight
      this.isHeightMoreThan259px = height > 259
    }
  }

  ngOnInit() {
    // console.log('=======================================')
    // console.log('this.selectedBid = ' + this.selectedBid)
  }
}
