import { Component, OnInit, Input } from '@angular/core';
import { User } from '@class/user';

declare let escape: any;

@Component({
  selector: 'app-profile-social',
  templateUrl: './social.component.html',
  styleUrls: ['../../profile.component.scss']
})
export class SocialComponent implements OnInit {
  @Input() userModel: User;
  shareLink = '';

  constructor() { }

  ngOnInit() {
    if (this.userModel && this.userModel.friendlyUrl !== '') {
      this.shareLink = this.userModel.friendlyUrl;
    } else {
      this.shareLink = escape(window.location.href);
    }
  }

  onShare() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + this.shareLink + '&t=' + document.title, '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

  onTweet() {
    window.open('https://twitter.com/intent/tweet?url=' + this.shareLink + '&text=' + document.title + '&original_referer=' + escape('https://canya.com'), '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

}
