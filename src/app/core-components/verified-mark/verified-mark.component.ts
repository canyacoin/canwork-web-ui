import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-verified-mark',
  templateUrl: './verified-mark.component.html',
  styleUrls: ['./verified-mark.component.css'],
})
export class VerifiedMarkComponent {
  @Input() user: any

  constructor() {}
}
