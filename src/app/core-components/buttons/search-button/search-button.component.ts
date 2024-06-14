import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'search-button',
  templateUrl: './search-button.component.html',
})
export class SearchButtonComponent {
  @Input() content!: string
}
