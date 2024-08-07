import { Component, OnInit, Input, Directive } from '@angular/core'
import { User } from '@class/user'
import { environment } from '@env/environment'

declare let escape: any

@Component({
  selector: 'app-profile-social',
  templateUrl: './social.component.html',
})
export class SocialComponent implements OnInit {
  @Input() userModel: User
  shareLink = 'https://canwork.io/profile/'

  constructor() {}

  ngOnInit() {
    if (this.userModel && this.userModel.slug !== '') {
      this.shareLink += this.userModel.slug
    } else {
      this.shareLink = escape(window.location.href)
    }
  }

  onShare() {
    window.open(
      'https://www.facebook.com/sharer/sharer.php?u=' +
        this.shareLink +
        '&t=' +
        document.title,
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600'
    )
    return false
  }

  onTweet() {
    window.open(
      'https://twitter.com/intent/tweet?url=' +
        this.shareLink +
        '&text=' +
        document.title +
        '&original_referer=' +
        escape('https://canwork.io'),
      '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600'
    )
    return false
  }

  copyLink() {
    let link = this.shareLink
    const selBox = document.createElement('textarea')
    selBox.style.position = 'fixed'
    selBox.style.left = '0'
    selBox.style.top = '0'
    selBox.style.opacity = '0'
    selBox.value = link
    document.body.appendChild(selBox)
    selBox.select()
    selBox.focus()
    document.execCommand('copy')
    document.body.removeChild(selBox)
    document.getElementById('copied').style.display = 'block'
    setTimeout(function () {
      document.getElementById('copied').style.display = 'none'
    }, 2000)
  }
}
