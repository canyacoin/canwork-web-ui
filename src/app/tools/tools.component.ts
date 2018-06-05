import { Component } from '@angular/core';
import { CanApps, App } from '../core-config/can-apps';

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css']
})
export class ToolsComponent {

  apps: App[] = CanApps;

  constructor() { }

}
