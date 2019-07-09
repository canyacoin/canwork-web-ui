import { animate, style, transition, trigger } from '@angular/animations';
import { NgSwitchCase } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkType, WalletType, Web3LoadingStatus } from '@service/eth.service';
import { User, UserType } from '@class/user';
import { AuthService } from '@service/auth.service';
import { NavService } from '@service/nav.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('100ms ease-in', style({ transform: 'translateY(0%)' }))
      ]),
      transition(':leave', [
        animate('120ms ease-out', style({ transform: 'translateY(-100%)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  currentUser: User;
  @Input() allowFilters = false;
  showFilters = false;
  hideSearchBar: boolean;

  hasUnreadMessages = false;
  messagesSubscription: Subscription;
  routerSub: Subscription;
  authSub: Subscription;
  navSub: Subscription;

  providerCategories = ['Content Creators', 'Designers & Creatives', 'Financial experts', 'Marketing & SEO', 'Software developers', 'Virtual assistants'];

  constructor(private afs: AngularFirestore,
    private navService: NavService,
    private authService: AuthService,
    private router: Router) {
  }

  async ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(async (user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user;
        await this.initUser();
      }
    });
    this.navSub = this.navService.hideSearchBar$.subscribe((hide: boolean) => {
      this.hideSearchBar = hide;
    });
  }

  async initUser() {
    if (this.currentUser && this.currentUser.address) {
      const unreadConversations = this.afs.collection('chats').doc(this.currentUser.address).collection('channels', ref => ref.where('unreadMessages', '==', true));

      if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(x => {
        const hadUnread = this.hasUnreadMessages;
        const hasUnread = x.length > 0;
        this.hasUnreadMessages = x.length > 0;
        if (!hadUnread && this.hasUnreadMessages) {
          // request permission to show desktop notifications
          if (Notification.permission !== 'granted') {
            Notification.requestPermission();
          } else {
            const notification = new Notification('CanWork', {
              icon: 'https://www.canwork.io/assets/img/favicon.jpg',
              body: 'You have unread chat messages on CanWork',
            });
          }
        }
      }, error => { console.error('! unable to retrieve chat/channel data:', error); });
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
    if (this.routerSub) { this.routerSub.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
    if (this.navSub) { this.navSub.unsubscribe(); }
  }

  onFocus(event: any) {
    this.showFilters = true;
  }

  onBlur(event: any) {
    setTimeout(() => {
      this.showFilters = false;
    }, 50);
  }

  onSubmit(event: any) {
    // if ((<any>window).$('html, body')) {
    //   (<any>window).$('html, body').animate({ scrollTop: -10 }, 600);
    // }
    this.router.navigate(['search'], { queryParams: { 'query': event } });
  }

  onCancel() {

  }

  onLogout() {
    this.authService.logout();
  }
}
