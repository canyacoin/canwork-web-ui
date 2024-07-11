import { Component, Input, OnInit, Directive } from '@angular/core'
import { User } from '@class/user'

@Component({
  selector: 'verified-mark',
  templateUrl: './verified-mark.component.html',
})
export class VerifiedMarkComponent implements OnInit {
  @Input() user: User

  constructor() {}

  ngOnInit() {}
}
