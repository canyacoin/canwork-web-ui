import { Component, Input } from '@angular/core'

@Component({
  selector: 'icon-text-button',
  templateUrl: './icon-text-button.component.html',
})
export class IconTextButtonComponent {
  // type can be edit, delete
  @Input() type: string
  @Input() title!: string
  @Input() extraClass: string = ''
}
