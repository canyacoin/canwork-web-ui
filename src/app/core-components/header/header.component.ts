import { NgModule } from '@angular/core'

import { animate, style, transition, trigger, state } from '@angular/animations'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router, NavigationEnd } from '@angular/router'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Subscription } from 'rxjs'
import { BscService, EventTypeBsc } from '@service/bsc.service'
import { WindowService } from 'app/shared/services/window.service'
import { HeaderService } from 'app/shared/constants/header'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  animations: [
    trigger('hamburguerX', [
      state('hamburguer', style({})),
      state(
        'topX',
        style({
          transform: 'rotate(45deg)',
          transformOrigin: 'left',
          margin: '9px',
        })
      ),
      state(
        'hide',
        style({
          opacity: 0,
        })
      ),
      state(
        'bottomX',
        style({
          transform: 'rotate(-45deg)',
          transformOrigin: 'left',
          margin: '10px',
        })
      ),
      state(
        'show',
        style({
          opacity: 100,
        })
      ),
      transition('* => *', [
        animate('0.2s'), // controls animation speed
      ]),
    ]),
  ],
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerSection = HeaderService
  // flag be consumed by the template
  isHamburguer = true
  items: any[]
  selectedItem: any | undefined
  onHamburguerClick() {
    this.isHamburguer = !this.isHamburguer
  }

  currentUser: User
  bAddress: string

  hasUnreadMessages = true
  unreadMsgCount = 0
  messagesSubscription: Subscription
  routerSub: Subscription
  authSub: Subscription
  navSub: Subscription
  binanceSub: Subscription
  bscSub: Subscription

  // for scroll effect only
  isScrolled: boolean = false
  isTransfer: boolean
  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private bscService: BscService,
    private windowService: WindowService,
    private router: Router,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    // Check router
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentRoute = event.url

        if (
          currentRoute.includes('/inbox') ||
          currentRoute.includes('/profile') ||
          currentRoute.includes('/wallet-bnb') ||
          currentRoute.includes('/public') ||
          currentRoute.includes('/auth') ||
          currentRoute.includes('/jobs/')
        ) {
          this.isTransfer = true
        } else {
          this.isTransfer = false
        }
      }
    })

    this.items = [
      {
        label: 'Profile',
        routerLink: '/profile',
        icon: 'fi_user.svg',
      },
      {
        label: 'Edit Profile',
        icon: 'fi_edit.svg',
        routerLink: '/profile',
        queryParams: { editProfile: 1 },
      },
      {
        label: 'Manage Jobs',
        icon: 'fi_briefcase.svg',
        routerLink: '/inbox/jobs',
      },
      {
        label: 'Web3 Wallet',
        routerLink: '/inbox/jobs',
        icon: 'u_wallet.svg',
      },
      {
        label: 'Settings',
        routerLink: '/inbox/jobs',
        icon: 'fi_settings.svg',
      },
      {
        label: 'Act as Client',
        routerLink: '/inbox/jobs',
        icon: 'fi_user_swap.svg',
      },
      {
        label: 'LogOut',
        icon: 'fi_log-out.svg',
        styleClass: 'text-logout',
      },
    ]

    this.selectedItem = this.items[0]
    // scroll
    this.windowService.getScrollY().subscribe((scrollY) => {
      // Check if the scroll position is greater than 64px
      this.isScrolled = scrollY > 64
    })

    this.authSub = this.authService.currentUser$.subscribe(
      async (user: User) => {
        if (this.currentUser !== user) {
          this.currentUser = user
          await this.initUser()
        }
      }
    )

    this.bscSub = this.bscService.events$.subscribe((event) => {
      if (!event) {
        this.bAddress = ''
        return
      }
      switch (event.type) {
        case EventTypeBsc.ConnectSuccess:
        case EventTypeBsc.Update:
        case EventTypeBsc.AddressFound:
          this.bAddress = event.details.address
          break
        case EventTypeBsc.ConnectFailure:
        case EventTypeBsc.Disconnect:
          this.bAddress = ''
          break
      }
    })
  }

  ToastshowInfo() {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'You have unread chat messages.',
    })
  }

  async initUser() {
    if (this.currentUser && this.currentUser.address) {
      const unreadConversations = this.afs
        .collection('chats')
        .doc(this.currentUser.address)
        .collection('channels', (ref) =>
          ref.where('unreadMessages', '==', true)
        )

      if (this.messagesSubscription) {
        this.messagesSubscription.unsubscribe()
      }
      this.messagesSubscription = unreadConversations.valueChanges().subscribe(
        (x) => {
          const hadUnread = this.hasUnreadMessages
          this.unreadMsgCount = x.length
          this.hasUnreadMessages = x.length > 0
          if (!hadUnread && this.hasUnreadMessages) {
            this.ToastshowInfo()
          }
        },
        (error) => {
          // console.error('! unable to retrieve chat/channel data:', error)
        }
      )
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
    if (this.bscSub) {
      this.bscSub.unsubscribe()
    }
  }

  onLogout() {
    this.bscService.disconnect()
    this.authService.logout()
  }
}
