import { Injectable } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'

@Injectable()
export class SeoService {
  private siteName = 'CanWork'

  constructor(private title: Title, private meta: Meta) {}

  updateTitle(title: string) {
    this.title.setTitle(title)
  }

  updateMetaByProperty(property: string, content: string) {
    this.meta.updateTag({ property, content })
  }

  updateMetaByName(name: string, content: string) {
    this.meta.updateTag({ name, content })
  }

  updateAllSeoProperties(
    type: string,
    title: string,
    description: string,
    url: string,
    avatar: any,
    compressedAvatarUrl: any
  ) {
    let cwTitle = this.siteName + ' - ' + title
    let cwUrl =
      window.location.protocol + '//' + window.location.host + '/profile/' + url
    let cwImg = null
    if (avatar && avatar.uri && avatar.uri.trim()) cwImg = avatar.uri.trim() // current, retrocomp

    // use compressed thumb if exist and not a massive update (new)
    if (compressedAvatarUrl && compressedAvatarUrl != 'new')
      cwImg = compressedAvatarUrl

    /* META */
    this.updateTitle(cwTitle)
    this.updateMetaByName('title', cwTitle)
    this.updateMetaByName('description', description)

    /* Facebook */
    this.updateMetaByProperty('og:site_name', this.siteName)
    this.updateMetaByProperty('og:title', title)
    this.updateMetaByProperty('og:description', description)
    this.updateMetaByProperty('og:url', cwUrl)
    if (cwImg) {
      this.updateMetaByProperty('og:image', cwImg)
      this.updateMetaByProperty('og:image:width', '255')
      this.updateMetaByProperty('og:image:height', '255')
    }

    /* Twitter */
    this.updateMetaByProperty('twitter:title', title)
    this.updateMetaByProperty('twitter:description', description)
    this.updateMetaByProperty('twitter:url', cwUrl)
    if (cwImg) this.updateMetaByProperty('twitter:image', cwImg)
  }
}
