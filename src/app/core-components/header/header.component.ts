import { animate, style, transition, trigger } from '@angular/animations';
import { NgSwitchCase } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NetworkType, WalletType, Web3LoadingStatus } from '@canyaio/canpay-lib';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import { User } from '@class/user';
import { AuthService } from '@service/auth.service';
import { CanWorkEthService } from '@service/eth.service';
import { NavService } from '@service/nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
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

  web3Sub: Subscription;
  accountSub: Subscription;
  web3State: Web3LoadingStatus;
  netType: NetworkType;
  accountInterval: any;
  account: string;
  canBalance = '0.00';

  providerCategories = ['Content Creators', 'Designers & Creatives', 'Financial experts', 'Marketing & SEO', 'Software developers', 'Virtual assistants'];

  constructor(private afs: AngularFirestore,
    private navService: NavService,
    private authService: AuthService,
    private ethService: CanWorkEthService,
    private router: Router) {
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.initUser();
        this.currentUser = user;
      }
    });
    this.navSub = this.navService.hideSearchBar$.subscribe((hide: boolean) => {
      this.hideSearchBar = hide;
    });
    this.web3Sub = this.ethService.web3Status$.subscribe((state: Web3LoadingStatus) => {
      this.web3State = state;
      this.netType = this.ethService.netType;
      if (this.web3State === Web3LoadingStatus.complete) {
        this.accountSub = this.ethService.account$.subscribe((acc: string) => {
          this.account = acc;
          if (acc === undefined || acc == null) {
            clearInterval(this.accountInterval);
          } else {
            this.updateBalanceAsync();
            this.accountInterval = setInterval(async () => {
              this.updateBalanceAsync();
            }, 120000);
          }
        });
      }
    });
  }

  async updateBalanceAsync() {
    const bal = await this.ethService.getCanYaBalance();
    this.canBalance = bal;
  }

  initUser() {
    if (this.currentUser) {
      const unreadConversations = this.afs.collection('chats').doc(this.currentUser.address).collection('channels', ref => ref.where('unreadMessages', '==', true));
      if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(x => {
        this.hasUnreadMessages = x.length > 0;
      }, error => { console.error('! unable to retrieve chat/channel data:', error); });
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
    if (this.routerSub) { this.routerSub.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
    if (this.navSub) { this.navSub.unsubscribe(); }
    if (this.web3Sub) { this.web3Sub.unsubscribe(); }
    if (this.accountSub) { this.accountSub.unsubscribe(); }
    clearInterval(this.accountInterval);
  }

  getWeb3Color(): string {
    switch (this.web3State) {
      case Web3LoadingStatus.complete:
        return '#30D7A9';
      case Web3LoadingStatus.noAccountsAvailable:
      case Web3LoadingStatus.loading:
        return '#ffc600';
      case Web3LoadingStatus.error:
      case Web3LoadingStatus.noMetaMask:
      case Web3LoadingStatus.wrongNetwork:
        return '#ff4954';
      default:
        return '#ff4954';
    }
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
    this.router.navigate(['home'], { queryParams: { 'query': event } });
  }

  onCancel() {

  }

  onLogout() {
    this.authService.logout();
  }
}
