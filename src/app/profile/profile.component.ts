import { Component, OnDestroy, OnInit } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { SeoService } from '@service/seo.service'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'
// spinner
import { NgxSpinnerService } from 'ngx-spinner'
import { MessageService } from 'primeng/api'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User

  userModel: User
  authSub: Subscription

  paramsSub: Subscription

  visibleEditProfileDialog: boolean = false
  visibleEditBioDialog: boolean = false
  notifiedBnbOrBscAddress: boolean = false

  navigationAddress = null

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private seoService: SeoService,
    private spinner: NgxSpinnerService,
    private messageService: MessageService
  ) {
    const navigation = this.router.getCurrentNavigation()
    this.navigationAddress = navigation.extras.state
      ? navigation.extras.state.id
      : null
  }

  ngOnInit() {
    if (!this.authService.currentUser$) return // not server side

    this.spinner.show()
    this.authSub = this.authService.currentUser$.subscribe(
      (user: User) => {
        if (user !== this.currentUser) {
          this.currentUser = user

          this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
            this.initUsers(this.currentUser, params)
          })
          this.activatedRoute.queryParams.subscribe((params) => {
            const redirected = this.redirectToUniqueUrlIfNecessary(params)
            if (!redirected) {
              this.notifyAddAddressIfNecessary(user)
            }

            this.visibleEditProfileDialog = params.editProfile ? true : false
          })
        }
      },
      (error) => {
        console.error('! unable to retrieve currentUser data:', error)
      }
    )
    setTimeout(() => {
      /** spinner ends after 3000ms */
      this.spinner.hide()
    }, 3000)
  }

  ngOnDestroy() {
    if (this.paramsSub) {
      this.paramsSub.unsubscribe()
    }
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  async notifyAddAddressIfNecessary(loggedInUser: User) {
    if (!loggedInUser) return
    if (this.notifiedBnbOrBscAddress) {
      return
    }
    const noAddress = !!loggedInUser && !loggedInUser.bscAddress
    if (noAddress && loggedInUser.type == 'Provider') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Add BNB Chain (BEP20) wallet to receive payments',
      })
      this.notifiedBnbOrBscAddress = true
    }
  }

  initUsers(user: User, params: any) {
    const { address: originalAddress, slug } = params
    let address = originalAddress
    // we have address, use it so we can retrieve object by id from algolia
    if (!originalAddress && this.navigationAddress)
      address = this.navigationAddress

    if (
      (address && this.currentUser && this.currentUser.address === address) ||
      (slug && this.currentUser && this.currentUser.slug === slug)
    ) {
      // optimize, use current user data if logged in
      // console.log('initUsers preload current')
      this.userModel = this.currentUser
      this.setUsersColors(this.userModel)
      return
    }

    if (address && address !== 'setup') {
      this.loadUser({ address })
    } else if (slug) {
      this.userService.getUserBySlug(slug).then((user) => {
        if (user) {
          this.userModel = user

          this.seoService.updateAllSeoProperties(
            'profile',
            this.userModel.name,
            this.userModel.bio,
            this.userModel.slug,
            this.userModel.avatar,
            this.userModel.compressedAvatarUrl
          )
        }
      })
    } else if (user) {
      this.userModel = this.currentUser
      this.setUsersColors(this.userModel)
    }
  }

  loadUser(params: any) {
    const address = params['address']
    this.userService
      .getUserById(address)
      .then((user: User) => {
        // console.log('user profile===========================>', user)
        this.userModel = user
        this.redirectToUniqueUrlIfNecessary(params)
        this.setUsersColors(this.userModel)
        this.saveWhoViewProfile()
        this.addToViewedProfileList()
      })
      .catch((err) => {
        console.log(`loadUser ${address} error: ${err.toString()}`)
        console.log(err)
      })
  }

  showEditBioDialog() {
    this.visibleEditBioDialog = true
  }

  showEditProfileDialog() {
    this.visibleEditProfileDialog = true
  }

  closeEditDialog() {
    this.visibleEditProfileDialog = false
    this.router.navigate(['.'], {
      relativeTo: this.activatedRoute,
      queryParams: {},
    })
  }

  setUsersColors(user: User) {
    if (user && user.colors.length <= 0) {
      user.colors = ['#00FFCC', '#33ccff', '#15EDD8']
    }
  }

  saveWhoViewProfile() {
    if (this.notMyProfile() && this.currentUser) {
      this.userService.saveProfileView(this.currentUser, this.userModel.address)
    }
  }

  addToViewedProfileList() {
    if (this.notMyProfile() && this.currentUser) {
      this.userService.addToViewedUsers(
        this.currentUser.address,
        this.userModel
      )
    }
  }

  isMyProfile() {
    if (this.currentUser == null) {
      return false
    }
    return this.userModel && this.userModel.address === this.currentUser.address
  }

  notMyProfile() {
    if (!this.currentUser && this.userModel) {
      return true
    }
    return this.userModel && this.userModel.address !== this.currentUser.address
  }

  redirectToUniqueUrlIfNecessary(params: any) {
    const { address } = params
    if (this.isMyProfile() && this.router.url.endsWith('/profile')) {
      this.router.navigate(['/profile', this.currentUser.slug])
      return true
    } else if (this.userModel && address && address !== 'setup') {
      this.router.navigate(['/profile', this.userModel.slug])
      return true
    }
    return false
  }
}
