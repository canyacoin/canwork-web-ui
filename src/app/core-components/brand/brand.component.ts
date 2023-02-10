import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.css'],
})
export class BrandComponent implements OnInit {
  supportInboxUrl = 'mailto:support@canwork.io'
  telegramChannelUrl = 'https://t.me/joinchat/GI97FhDD1lf6dh-r9XRdvA'

  constructor() {}

  ngOnInit() {}
}
