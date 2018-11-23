import { WINDOW } from '@ng-toolkit/universal';
import { Component, OnInit , Inject} from '@angular/core';

declare let escape: any;

@Component({
  selector: 'app-profile-social',
  templateUrl: './social.component.html',
  styleUrls: ['../../profile.component.scss']
})
export class SocialComponent implements OnInit {

  constructor(@Inject(WINDOW) private window: Window, ) { }

  ngOnInit() { }

  onShare() {
    this.window.open('https://www.facebook.com/sharer/sharer.php?u=' + escape(this.window.location.href) + '&t=' + document.title, '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

  onTweet() {
    this.window.open('https://twitter.com/intent/tweet?url=' + escape(this.window.location.href) + '&text=' + document.title + '&original_referer=' + escape('https://canya.com'), '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

}
