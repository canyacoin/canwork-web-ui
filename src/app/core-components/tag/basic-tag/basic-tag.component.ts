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
        'bg-white hover:bg-G800 active:bg-black text-G800 hover:text-white active:text-white border border-G300 hover:border-G800 active:border-black'
    else if (this.type === 2)
      style +=
        'bg-blue-10 hover:bg-blue-50 active:bg-blue-500 text-C800 border-none'

    return style
  }
}
