import { Component, Input, OnInit, Directive } from '@angular/core'

@Component({
  selector: 'verified-mark',
  templateUrl: './verified-mark.component.html',
})
export class VerifiedMarkComponent implements OnInit {
  @Input() user: any

  constructor() {}

  ngOnInit() {}
}
