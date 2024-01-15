import { Component, Input } from '@angular/core'

@Component({
  selector: 'basic-button',
  templateUrl: './basic-button.component.html',
})
export class BasicButtonComponent {
  @Input() type!: number
  @Input() title!: string
  @Input() size: string = 'medium'
  @Input() extraClass: string = ''

  get cssClasses() {
    let style = ''

    if (this.type === 1)
      style +=
        ' bg-white hover:bg-G900 active:bg-black text-G900 hover:text-white border border-G300 hover:border-G900 active:border-black'
    else if (this.type === 2)
      style += ' bg-G900 hover:bg-C500 active:bg-C800 text-white border-none'

    if (this.size === 'medium') style += ' text-b1 px-[40px] py-[10px]'
    else if (this.size === 'small') style += ' text-b2 px-[24px] py-[12px]'

    return style
  }
}
