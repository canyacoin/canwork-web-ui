import { Component, Input, OnInit } from '@angular/core'

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
