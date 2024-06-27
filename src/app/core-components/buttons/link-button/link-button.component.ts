import { Component, Input } from '@angular/core'

@Component({
  selector: 'link-button',
  templateUrl: './link-button.component.html',
})
export class LinkButtonComponent {
  @Input() type!: number
  @Input() title!: string
  @Input() size: string = 'medium'

  get cssClasses() {
    let style = ''

    if (this.type === 1)
      style +=
        ' text-white active:text-G400 decoration-white active:decoration-G400'
    else if (this.type === 2)
      style +=
        ' text-G900 active:text-black decoration-G900 active:decoration-black'

    if (this.size === 'medium') style += ' text-b1'
    else if (this.size === 'small') style += ' text-b2'

    return style
  }
}
