import { Component, Input } from '@angular/core'

@Component({
  selector: 'badge',
  templateUrl: './badge.component.html',
})
export class BadgeComponent {
  @Input() value!: number
}
