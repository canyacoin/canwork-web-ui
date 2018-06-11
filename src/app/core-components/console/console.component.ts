import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../core-services/auth.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.css']
})
export class ConsoleComponent implements OnInit, AfterViewInit, OnDestroy {

  conversation: any = [
    { flow: 'Hi!, CanYa do something for you?', command: 'message' },
    {
      flow: {
        field: 'state', actions: [
          { caption: 'Give feedback', type: 'button', icon: 'ti-comments', hideCaption: false },
          { caption: 'Reports', type: 'button', icon: 'ti-bar-chart', hideCaption: false },
          { caption: 'Sign-out', type: 'button', icon: 'ti-power-off', hideCaption: false }
        ]
      }, command: 'actions'
    }
  ];

  banners: any = [
    { image: 'assets/img/BannerCanMessages.png', link: '/tools' },
    { image: 'assets/img/BannerCanMessages2.png', link: '/tools' },
    { image: 'assets/img/BannerUport.png', link: '/tools' },
    { image: 'assets/img/BannerBuyCAN.png', link: '/buy' },
  ];
  rndBanner = 3;
  hideBanner = false;

  routerSub: Subscription;

  constructor(private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.routerSub = this.activatedRoute.url.subscribe((url) => {
      this.rndBanner = Math.floor(Math.random() * 4);
    });
  }

  ngOnDestroy() {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  onLogout() {
    this.authService.logout();
  }

  onAction(event: any) {
    console.log('onAction', event);

    if (event.object === 'Give feedback') {
      (<any>window).open('https://forum.canya.io/');
    }

    if (event.object === 'Reports') {
      this.conversation.push({ flow: 'This feature is coming soon. Stay tuned!', command: 'message' });
    }

    if (event.object === 'Sign-out') {
      this.conversation.push({ flow: 'Are you sure?', command: 'message' });
      this.conversation.push({
        flow: {
          field: 'state', actions: [
            { caption: 'Yes, sign-out', type: 'button', hideCaption: false },
            { caption: 'No, cancel', type: 'button', hideCaption: false }
          ]
        }, command: 'actions'
      });
    }

    if (event.object === 'Yes, sign-out') {
      this.onLogout();
    }

    // if (event.object === 'Colors') {
    //   this.conversation.push( { flow: 3, command: 'colors' } );
    // }

    // if ( event.field === 'colors' ) {
    //   this.userService.saveData(event.field, event.object);
    // }

    // if (event.object === 'Profile') {
    //   this.router.navigate(['/profile']);
    // }

    // if (event.object === 'Reports') {
    //   alert('Coming soon! Stay tuned!');
    // }

    // if (event.object === 'Tools') {
    //   this.router.navigate(['/tools']);
    // }

    // if (event.object === 'Done') {
    //   this.router.navigate(['/home']);
    // }

    this.conversation.push({ flow: 'CanYa do something more?', command: 'message' });
    this.conversation.push({
      flow: {
        field: 'state', actions: [
          // { caption: 'Price', type: 'button' },
          // { caption: 'Colors', type: 'button', icon: 'ti-palette', hideCaption: true },
          { caption: 'Give feedback', type: 'button', icon: 'ti-comments', hideCaption: false },
          { caption: 'Reports', type: 'button', icon: 'ti-bar-chart', hideCaption: false },
          // { caption: 'Tools', type: 'button', icon: 'fa fa-cogs', hideCaption: true },
          { caption: 'Sign-out', type: 'button', icon: 'ti-power-off', hideCaption: false },
          // { caption: 'Done', type: 'button' }
        ]
      }, command: 'actions'
    });
  }
}
