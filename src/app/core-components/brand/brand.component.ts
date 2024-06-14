import { Component, OnInit, Directive } from '@angular/core'

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
})
export class BrandComponent implements OnInit {
  supportInboxUrl = 'mailto:support@canwork.io'
  telegramChannelUrl = 'https://t.me/joinchat/GI97FhDD1lf6dh-r9XRdvA'

  constructor() {}

  ngOnInit() {}
}
