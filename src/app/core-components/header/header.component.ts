import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subscription } from 'rxjs/Subscription';

import { AuthService } from '../../core-services/auth.service';

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

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  @Input() allowFilters = false;
  showFilters = false;

  hasUnreadMessages = false;
  messagesSubscription: Subscription;
  routerSub: Subscription;

  providerCategories = ['Content Creators', 'Designers & Creatives', 'Financial experts', 'Marketing & SEO', 'Software developers', 'Virtual assistants'];

  constructor(private afs: AngularFirestore,
    private auth: AuthService,
    private router: Router) {
  }

  ngOnInit() {
    this.initUser();
    this.routerSub = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.initUser();
      }
    });
  }

  initUser() {
    this.currentUser = JSON.parse(localStorage.getItem('credentials'));
    if (this.currentUser) {
      const unreadConversations = this.afs.collection('chats').doc(this.currentUser.address).collection('channels', ref => ref.where('unreadMessages', '==', true));
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(x => {
        this.hasUnreadMessages = x.length > 0;
      });
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
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
    this.auth.logout();
  }
}
