import { Component, OnInit, Input, Directive } from '@angular/core'

@Component({
  selector: 'dynamic-coin-wrapper',
  templateUrl: './dynamic-coin-wrapper.component.html',
  styleUrls: ['./dynamic-coin-wrapper.component.css'],
})
export class DynamicCoinWrapperComponent implements OnInit {
  sizes = {
    big: '44px',
    small: '32px',
    normal: '28px',
  }

  fontSizes = {
    big: '12px',
    small: '10px',
    normal: '9px',
  }

  @Input()
  size: string

  @Input()
  startCol: string

  @Input()
  stopCol: string

  constructor() {}

  ngOnInit() {}
  background() {
    return `linear-gradient(45deg, ${this.startCol}, ${this.stopCol})`
  }
}
