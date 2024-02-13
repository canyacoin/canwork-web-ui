import { Component, Input } from '@angular/core'

@Component({
  selector: 'basic-tag',
  templateUrl: './basic-tag.component.html',
})
export class BasicTagComponent {
  @Input() type!: number
  @Input() title!: string

  get cssClasses() {
    let style = ''

    if (this.type === 1)
      style +=
        'bg-white hover:bg-G200 active:bg-G300 text-G700 border border-G300 hover:border-G200 active:border-G300'
    else if (this.type === 2)
      style +=
        'bg-blue-10 hover:bg-blue-50 active:bg-blue-500 text-C800 border-none'
    else if (this.type === 3)
      style += 'bg-blue-50 hover:bg-blue-70 text-white border-none'

    return style
  }
}
