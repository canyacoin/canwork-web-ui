import { Component, Input } from '@angular/core';

import { DefaultImages } from '../../../../core-classes/default-images.enum';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent {

  @Input() workItem: any;
  @Input() isMyProfile: boolean;
  defaultImage = DefaultImages.workPlaceHolder;

  constructor() { }
}
