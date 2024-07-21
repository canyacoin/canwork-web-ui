import { Component } from '@angular/core'

interface ItemType {
  name: string
  img: string
  code: string
}

@Component({
  selector: 'share-button',
  templateUrl: './share-button.component.html',
})
export class ShareButtonComponent {
  shareLinks: ItemType[] | undefined
  selectedShareLinks: ItemType | undefined

  ngOnInit() {
    this.shareLinks = [
      { name: 'Invite Freelancer', img: 'fi_user-plus.svg', code: '0' },
      { name: 'Copy Link', img: 'u_link.svg', code: '1' },
      { name: 'Twitter', img: 'x.svg', code: '2' },
      { name: 'Facebook', img: 'logos_facebook.svg', code: '3' },
      { name: 'Linkedin', img: 'devicon_linkedin.svg', code: '4' },
    ]

    this.selectedShareLinks = this.shareLinks[0]
  }
}
