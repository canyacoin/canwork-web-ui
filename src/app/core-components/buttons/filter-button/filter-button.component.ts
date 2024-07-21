import { Component, Input } from '@angular/core'

@Component({
  selector: 'filter-button',
  templateUrl: './filter-button.component.html',
})
export class FilterButtonComponent {
  @Input() searchItemsCount: number = 0
}
