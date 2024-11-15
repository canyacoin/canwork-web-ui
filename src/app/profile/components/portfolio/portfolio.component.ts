import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  Directive,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { Router } from '@angular/router'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
import { User } from '../../../core-classes/user'
import { AuthService } from '../../../core-services/auth.service'
import { ChatService } from '../../../core-services/chat.service'

import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'app-profile-portfolio',
  templateUrl: './portfolio.component.html',
})
export class PortfolioComponent implements OnInit, OnDestroy {
  @Input() userModel: User
  @Input() isMyProfile: boolean
  @Input() notMyProfile: boolean

  allPortfolioItems: any[] = []
  loaded = false

  pageLimit = 2
  currentPage = 0
  lastPage = 0
  animation = 'fadeIn'

  portfolioSubscription: Subscription

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.setPortfolio(this.userModel.address)
  }

  ngOnDestroy() {
    if (this.portfolioSubscription) {
      this.portfolioSubscription.unsubscribe()
    }
  }

  setPortfolio(address: string) {
    const portfolioRecords = this.afs.collection(
      `portfolio/${address}/work`,
      (ref) => ref.orderBy('timestamp', 'desc')
    )
    this.portfolioSubscription = portfolioRecords.valueChanges().subscribe(
      (data: any) => {
        this.allPortfolioItems = data
        this.lastPage =
          Math.ceil(this.allPortfolioItems.length / this.pageLimit) - 1
        this.loaded = true
      },
      (error) => {
        console.error('! unable to retrieve portfolio data:', error)
      }
    )
  }

  paginatedPortfolioItems() {
    return this.allPortfolioItems.slice(
      this.currentPage * this.pageLimit,
      this.currentPage * this.pageLimit + this.pageLimit
    )
  }

  nextPage() {
    this.animation = 'fadeOut'
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.currentPage++
        this.animation = 'fadeIn'
      }, 300)
    } else {
      this.currentPage++
      this.animation = 'fadeIn'
    }
  }

  previousPage() {
    this.animation = 'fadeOut'
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.currentPage--
        this.animation = 'fadeIn'
      }, 300)
    } else {
      this.currentPage--
      this.animation = 'fadeIn'
    }
  }

  postRequest() {
    this.router.navigate(['inbox/post', this.userModel.address])
  }

  // Chat the user without proposing a job
  chatUser() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.chatService.createNewChannel(user, this.userModel)
      } else {
        this.router.navigate(['auth/login'])
      }
    })
  }
}
