import { Component, OnInit, Input } from '@angular/core';
import { serializePath } from '@angular/router/src/url_tree';

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.css']
})
export class ProviderCardComponent implements OnInit {

  @Input() provider: any;
  @Input() size: string;

  constructor() { }

  ngOnInit() {
  }

}
