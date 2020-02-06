import { Component, OnInit } from '@angular/core'

declare var createHelperCards: any

@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.css'],
})
export class ToolsComponent implements OnInit {
  canApps = [
    [
      'CanInvoice',
      'https://caninvoice.io',
      'Easily create your own clean, professional and accurate invoices',
    ],
    [
      'CanShare',
      'https://canshare.io',
      'Send and receive files using distributed technology',
    ],
  ]
  constructor() {}

  ngOnInit() {}
}
