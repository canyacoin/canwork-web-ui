import { Component, Input } from '@angular/core'

@Component({
  selector: 'sk-profile-card',
  templateUrl: './sk-profile-card.component.html',
})
export class SkProfileCardComponent {
  @Input() isGrid: boolean = true
}
