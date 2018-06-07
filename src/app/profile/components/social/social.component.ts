import { Component, OnInit } from '@angular/core';

declare let escape: any;

@Component({
  selector: 'app-profile-social',
  templateUrl: './social.component.html',
  styleUrls: ['../../profile.component.css']
})
export class SocialComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

  onShare() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + escape(window.location.href) + '&t=' + document.title, '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

  onTweet() {
    window.open('https://twitter.com/intent/tweet?url=' + escape(window.location.href) + '&text=' + document.title + '&original_referer=' + escape('https://canya.com'), '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

}
