import { Component, Input, OnInit, Directive } from '@angular/core'

@Directive()
@Component({
  selector: 'app-verified-mark',
  templateUrl: './verified-mark.component.html',
  styleUrls: ['./verified-mark.component.css'],
})
export class VerifiedMarkComponent implements OnInit {
  @Input() user: any

  constructor() {}

  ngOnInit() {}
}
