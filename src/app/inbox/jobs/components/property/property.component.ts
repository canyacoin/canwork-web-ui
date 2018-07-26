import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css']
})
export class PropertyComponent {

  @Input() property: string;
  @Input() value: string;

  constructor() { }


}
