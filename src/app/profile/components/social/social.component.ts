import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { User } from '@class/user';
import { environment } from '@env/environment';

declare let escape: any;

@Component({
  selector: 'app-profile-social',
  templateUrl: './social.component.html',
  styleUrls: ['../../profile.component.scss']
})
export class SocialComponent implements OnInit, AfterViewInit {
  @Input() userModel: User;
  shareLink = environment.shareBaseUrl + '/profile/';

  constructor() { }

  ngOnInit() {}
  ngAfterViewInit() {
    if (this.userModel && this.userModel.slug !== '') {
      this.shareLink += this.userModel.slug;
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
