import { animate, style, transition, trigger } from '@angular/animations'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { NavService } from '@service/nav.service'
import { AngularFirestore } from 'angularfire2/firestore'
import { Subscription } from 'rxjs'
import { BinanceService, EventType } from '@service/binance.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('100ms ease-in', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [
        animate('120ms ease-out', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User
  @Input() allowFilters = false
  showFilters = false
  hideSearchBar: boolean
  bnbAddress: string
  isAdmin = false

  hasUnreadMessages = false
  isDAO = false
  messagesSubscription: Subscription
  routerSub: Subscription
  authSub: Subscription
  navSub: Subscription
  binanceSub: Subscription

  providerCategories = [
    'Content Creators',
    'Designers & Creatives',
    'Financial experts',
    'Marketing & SEO',
    'Software developers',
    'Virtual assistants',
  ]

  constructor(
    private afs: AngularFirestore,
    private navService: NavService,
    private authService: AuthService,
    private router: Router,
    private binanceService: BinanceService
  ) {}

  async ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe(
      async (user: User) => {
        if (this.currentUser !== user) {
          this.currentUser = user
          await this.initUser()
        }
      }
    )
    this.isAdmin = this.authService.isAdmin()
    this.navSub = this.navService.hideSearchBar$.subscribe((hide: boolean) => {
      this.hideSearchBar = hide
    })

    this.binanceSub = this.binanceService.events$.subscribe(event => {
      if (!event) {
        this.bnbAddress = ''
        return
      }
      switch (event.type) {
        case EventType.ConnectSuccess:
        case EventType.Update:
          this.bnbAddress = event.details.address
          break
        case EventType.ConnectFailure:
        case EventType.Disconnect:
          this.bnbAddress = ''
          break
      }
    })
  }

  async initUser() {
    if (this.currentUser && this.currentUser.address) {
      // console.log(`currentUser: ${this.currentUser.address}`)
      const unreadConversations = this.afs
        .collection('chats')
        .doc(this.currentUser.address)
        .collection('channels', ref => ref.where('unreadMessages', '==', true))

      if (this.messagesSubscription) {
        this.messagesSubscription.unsubscribe()
      }
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(
        x => {
          const hadUnread = this.hasUnreadMessages
          this.hasUnreadMessages = x.length > 0
          if (!hadUnread && this.hasUnreadMessages) {
            // request permission to show desktop notifications
            if (Notification.permission !== 'granted') {
              Notification.requestPermission()
            } else {
              const notification = new Notification('CanWork', {
                icon: 'https://www.canwork.io/assets/img/favicon.jpg',
                body: 'You have unread chat messages on CanWork',
              })
            }
          }
        },
        error => {
          // console.error('! unable to retrieve chat/channel data:', error)
        }
      )
      if (this.currentUser.isDAO) {
        this.isDAO = true
      }
    }
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe()
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe()
    }
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
    if (this.navSub) {
      this.navSub.unsubscribe()
    }
    if (this.binanceSub) {
      this.binanceSub.unsubscribe()
    }
  }

  onFocus(event: any) {
    this.showFilters = true
  }

  onBlur(event: any) {
    setTimeout(() => {
      this.showFilters = false
    }, 50)
  }

  onSubmit(event: any) {
    // if ((<any>window).$('html, body')) {
    //   (<any>window).$('html, body').animate({ scrollTop: -10 }, 600);
    // }
    this.router.navigate(['search'], { queryParams: { query: event } })
  }

  onCancel() {}

  onLogout() {
    this.binanceService.disconnect()
    this.authService.logout()
  }
}
