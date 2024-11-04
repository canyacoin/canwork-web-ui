import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-icon-text-button',
  templateUrl: './icon-text-button.component.html',
})
export class IconTextButtonComponent {
  @Input() type!: string
  @Input() title!: string
  @Input() extraClass: string = ''
}
