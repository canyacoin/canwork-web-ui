import { Component, OnInit, Input, Directive } from '@angular/core'
import * as union from 'lodash/union'

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html'
})
export class ProviderCardComponent implements OnInit {
  @Input() provider: any
  @Input() size: string

  constructor() {}

  ngOnInit() {}

  getProviderTags(provider: any): string[] {
    const allTags: string[] = union(
      provider.skillTags === undefined ? [] : provider.skillTags,
      provider.workSkillTags === undefined ? [] : provider.workSkillTags
    )
    if (allTags.length > 5) {
      const moreSymbol = '+ ' + (allTags.length - 5) + ' more'
      const arr = allTags.slice(0, 5)
      return arr.concat([moreSymbol])
    }
    return allTags
  }
}
