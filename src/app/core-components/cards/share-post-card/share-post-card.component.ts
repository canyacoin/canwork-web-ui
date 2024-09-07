import { Component } from '@angular/core'

@Component({
  selector: 'share-post-card',
  templateUrl: './share-post-card.component.html',
})
export class SharePostCardComponent {
  shareButtons = [
    {
      name: 'Link',
      icon: '/assets/massimo/images/smLink.png',
    },
    {
      name: 'X',
      icon: '/assets/massimo/images/smX.png',
    },
    {
      name: 'Facebook',
      icon: '/assets/massimo/images/smFacebook.png',
    },
    {
      name: 'Instagram',
      icon: '/assets/massimo/images/smInstagram.png',
    },
  ]
}
