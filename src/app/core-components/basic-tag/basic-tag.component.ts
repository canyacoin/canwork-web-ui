import { Component, Input } from '@angular/core'

@Component({
  selector: 'basic-tag',
  templateUrl: './basic-tag.component.html',
})
export class BasicTagComponent {
  @Input() type!: number
  @Input() title!: string

  get cssClasses() {
    return this.type === 1
      ? 'bg-white hover:bg-G800 active:bg-black text-G800 hover:text-white active:text-white border border-G300 hover:border-G800 active:border-black'
      : 'bg-blue-10 hover:bg-blue-50 active:bg-blue-500 text-C800 border-none'
  }
}
