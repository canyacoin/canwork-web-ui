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
      'CanTrack',
      'https://cantrack.io',
      'A crisp and easy to use task tracker to help you with your project',
    ],
    [
      'CanStation',
      'https://canstation.io',
      'Find out the ideal amount of gas to allocate to your ETH transaction',
    ],
    [
      'CanSend',
      'https://cansend.io',
      'Send ERC20 tokens to multiple addresses at once',
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
