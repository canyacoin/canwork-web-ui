import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { NavService } from '../../core-services/nav.service';

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

  providerCategories = ['Content Creators', 'Designers & Creatives', 'Financial experts', 'Marketing & SEO', 'Software developers', 'Virtual assistants'];

  constructor(private afs: AngularFirestore,
    private navService: NavService,
    private authService: AuthService,
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
  }

  initUser() {
    if (this.currentUser) {
      const unreadConversations = this.afs.collection('chats').doc(this.currentUser.address).collection('channels', ref => ref.where('unreadMessages', '==', true));
      if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(x => {
        this.hasUnreadMessages = x.length > 0;
      });
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) { this.messagesSubscription.unsubscribe(); }
    if (this.routerSub) { this.routerSub.unsubscribe(); }
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  onKeyUp(event: any) {
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
    if ((<any>window).$('html, body')) {
      (<any>window).$('html, body').animate({ scrollTop: -10 }, 600);
    }
    this.router.navigate(['search', event]);
  }

  onCancel() {

  }

  onLogout() {
    this.authService.logout();
  }
}
