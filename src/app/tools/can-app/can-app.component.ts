import { Component, Input } from '@angular/core';
import { App } from '../../core-config/can-apps';

@Component({
  selector: 'app-can-app',
  templateUrl: './can-app.component.html',
  styleUrls: ['./can-app.component.css']
})
export class CanAppComponent {

  @Input() app: App;

  constructor() {
  }

}
