import { Location } from '@angular/common'
import { Component, Input, OnDestroy, OnInit, Directive } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { ToastrService } from 'ngx-toastr'
import { PublicJobService } from '@service/public-job.service'
import { SeoService } from '@service/seo.service'
import { Subscription } from 'rxjs'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User
  currentUserJobs: any

  userModel: User
  authSub: Subscription

  paramsSub: Subscription

  displayEditComponent = false
  notifiedBnbOrBscAddress = false

  constructor(
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private publicJobService: PublicJobService,
    private toastr: ToastrService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
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
              this.notifyAddAddressIfNecessary()
            }
            this.displayEditComponent = params.editProfile ? true : false
          })
        }
      },
      (error) => {
        console.error('! unable to retrieve currentUser data:', error)
      }
    )
  }

  ngOnDestroy() {
    if (this.paramsSub) {
      this.paramsSub.unsubscribe()
    }
    if (this.authSub) {
      this.authSub.unsubscribe()
    }
  }

  async notifyAddAddressIfNecessary() {
    if (this.notifiedBnbOrBscAddress) {
      return
    }
    const noAddress = await this.authService.isAuthenticatedAndNoAddress()
    const user = await this.authService.getCurrentUser()
    if (noAddress && user.type == 'Provider') {
      this.toastr.warning('Add BNB Chain (BEP20) wallet to receive payments')
      this.notifiedBnbOrBscAddress = true
    }
  }

  initUsers(user: User, params: any) {
    const { address, slug } = params
    if (address && address !== 'setup') {
      this.loadUser(params)
    } else if (slug) {
      this.userService.getUserBySlug(slug).then((user) => {
        if (user) {
          this.userModel = user
          this.seoService.updateAllSeoProperties(
            'profile',
            this.userModel.name,
            this.userModel.bio,
            this.userModel.slug,
            this.userModel.avatar
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
      .getUser(address)
      .then((user: User) => {
        this.userModel = user
        this.redirectToUniqueUrlIfNecessary(params)
        this.setUsersColors(this.userModel)
        this.saveWhoViewProfile()
        this.addToViewedProfileList()
      })
      .catch((err) => {
        console.log('loadUser: error')
      })
  }

  closeEditDialog() {
    this.displayEditComponent = false
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
    if (this.notMyProfile) {
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
