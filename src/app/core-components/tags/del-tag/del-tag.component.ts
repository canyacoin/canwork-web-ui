import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'del-tag',
  templateUrl: './del-tag.component.html',
})
export class DelTagComponent {
  @Input() value!: string
  @Output() tagClick = new EventEmitter<any>() // Use specific type instead of any if possible

  handleClick(event: Event): void {
    event.preventDefault()
    this.tagClick.emit(this.value) // You can pass any value you need here
  }
}
