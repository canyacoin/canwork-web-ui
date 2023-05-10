// import { providerTypeArray } from './../../const/providerTypes'
import { animate, style, transition, trigger } from '@angular/animations'
import { Component, Input, OnDestroy, OnInit, Directive } from '@angular/core'
import { Router } from '@angular/router'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { NavService } from '@service/nav.service'
import { AngularFirestore } from '@angular/fire/firestore'
import { Subscription } from 'rxjs'
import { BscService, EventTypeBsc } from '@service/bsc.service'

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
  filterString = ''
  hideSearchBar: boolean
  bAddress: string

  hasUnreadMessages = false
  unreadMsgCount = 0
  messagesSubscription: Subscription
  routerSub: Subscription
  authSub: Subscription
  navSub: Subscription
  binanceSub: Subscription
  bscSub: Subscription

  // providerCategories = providerTypeArray
  // selectedProvType = providerTypeArray[0]

  constructor(
    private afs: AngularFirestore,
    private navService: NavService,
    private authService: AuthService,
    private router: Router,
    private bscService: BscService
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
    this.navSub = this.navService.hideSearchBar$.subscribe((hide: boolean) => {
      this.hideSearchBar = hide
    })

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

  async initUser() {
    if (this.currentUser && this.currentUser.address) {
      // console.log(`currentUser: ${this.currentUser.address}`)
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
            // request permission to show desktop notifications
            if (Notification.permission !== 'granted') {
              Notification.requestPermission()
            } else {
              const notification = new Notification('CanWork', {
                icon: 'https://app.canwork.io/assets/img/favicon.jpg',
                body: 'You have unread chat messages on CanWork',
              })
            }
          }
        },
        (error) => {
          // console.error('! unable to retrieve chat/channel data:', error)
        }
      )
      console.log(this.messagesSubscription)
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

  onFocus(event: any) {
    this.showFilters = true
  }

  onBlur(event: any) {
    setTimeout(() => {
      this.showFilters = false
    }, 50)
  }

  onSubmit() {
    let string = ''
    const el = document.getElementById('topnav-search')
    if (el) {
      string = (el as HTMLInputElement).value
    }
    // if ((<any>window).$('html, body')) {
    //   (<any>window).$('html, body').animate({ scrollTop: -10 }, 600);
    // }
    this.router.navigate(['search'], {
      queryParams: {
        // 'refinementList[category][0]': this.selectedProvType.name,
        // category: this.selectedProvType.id,
        query: string,
      },
    })
  }

  onSubmitFromModal() {
    let string = ''
    const el = document.getElementById('topnav-search-mobile')
    if (el) {
      string = (el as HTMLInputElement).value
    }
    ;(<any>window).$('#mobileMenuModal').modal('hide') // Close mobile menu modal
    this.router.navigate(['search'], {
      queryParams: { query: string },
    })
  }

  onCancel() {}

  onLogout() {
    this.bscService.disconnect()
    this.authService.logout()
  }

  // toggleDropdown() {
  //   document
  //     .getElementById('myDropdown')
  //     .classList.toggle('search-dropdown-show')
  // }

  // closeDropDown(value: any) {
  //   this.selectedProvType = value
  //   var myDropdown = document.getElementById('myDropdown')
  //   if (myDropdown.classList.contains('show')) {
  //     myDropdown.classList.remove('show')
  //   }
  // }
}
