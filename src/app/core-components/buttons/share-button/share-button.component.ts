import { Component, Input } from '@angular/core'
import { MessageService } from 'primeng/api'

interface ItemType {
  name: string
  img: string
  code: number
}

@Component({
  selector: 'share-button',
  templateUrl: './share-button.component.html',
})
export class ShareButtonComponent {
  @Input() link: string = ''

  shareLinks: ItemType[] | undefined
  selectedShareLinks: ItemType | undefined

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.shareLinks = [
      // { name: 'Invite Freelancer', img: 'fi_user-plus.svg', code: 0 },
      { name: 'Copy Link', img: 'u_link.svg', code: 1 },
      // { name: 'Twitter', img: 'x.svg', code: 2 },
      // { name: 'Facebook', img: 'logos_facebook.svg', code: 3 },
      // { name: 'Linkedin', img: 'devicon_linkedin.svg', code: 4 },
    ]

    this.selectedShareLinks = this.shareLinks[0]
  }

  itemClick(code: number) {
    if (code === 1 && this.link !== '') {
      // Copy link to clipboard
      navigator.clipboard.writeText(this.link)
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Link copied to clipboard!',
      })
    }
    this.selectedShareLinks = this.shareLinks.find(
      (item) => item.code === code
    )!
  }
}
