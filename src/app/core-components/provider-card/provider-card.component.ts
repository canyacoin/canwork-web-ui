import { Component, OnInit, Input } from '@angular/core'
import { serializePath } from '@angular/router/src/url_tree'
import * as union from 'lodash/union'

@Component({
  selector: 'app-provider-card',
  templateUrl: './provider-card.component.html',
  styleUrls: ['./provider-card.component.css'],
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
