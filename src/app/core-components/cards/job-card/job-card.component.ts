import { Component, Input, OnInit, OnDestroy } from '@angular/core'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'

import { providerTypeArray } from 'app/shared/constants/providerTypes'
import * as moment from 'moment'
@Component({
  selector: 'job-card',
  templateUrl: './job-card.component.html',
})
export class JobCardComponent implements OnInit, OnDestroy {
  @Input() id!: string
  @Input() clientId!: string
  @Input() providerId!: string
  @Input() description!: string
  @Input() paymentType!: string
  @Input() budget!: number
  @Input() deadline!: string
  @Input() slug!: string
  @Input() skills!: string[]
  @Input() title!: string
  @Input() createAt!: number

  @Input() proposals!: number
  @Input() projectType: string // 1. contentCreator 2. softwareDev 3. designer , 4. marketing 5. virtualAssistant ...

  jobPoster: any
  bids: any[]
  bidsSub: Subscription
  authSub: Subscription
  location: string = ''

  currentUser: User
  isApplied: boolean = false
  favourite: boolean = false

  constructor(
    private router: Router,
    private publicJobsService: PublicJobService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.jobPoster = await this.userService.getUser(this.clientId)
    this.location = this.jobPoster.timezone

    this.authSub = await this.authService.currentUser$.subscribe(
      (user: User) => {
        if (user) {
          this.currentUser = user
        }
      }
    )

    this.bidsSub = await this.publicJobsService
      .getPublicJobBids(this.id)
      .subscribe((result) => {
        this.bids = result || []
        if (this.currentUser)
          this.isApplied = this.bids.find(
            (b) => b.providerId === this.currentUser.address
          )
      })
  }

  ngOnDestroy(): void {
    // this.bidsSub.unsubscribe()
  }

  getbidslength() {
    if (this.bids) return this.bids.length
    else {
      return 0
    }
  }

  getProviderImage(id: string) {
    const category = providerTypeArray.find((prov) => prov.id === id)
    return category.iconSrc;
  }

  stripHtmlTags(html: string): string {
    // Create a new DOM element to use the browser's parsing capabilities
    const div = document.createElement('div')

    // Assign the HTML string to the innerHTML of the created element
    div.innerHTML = html

    // Use the textContent property to get the plain text without HTML tags
    return div.textContent || div.innerText || ''
  }

  timeAgo(createdAt: number): string {
    return moment(createdAt).fromNow()
  }
  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()

    const daySuffix = this.getDaySuffix(day)

    return `${day}${daySuffix} ${month} ${year}`
  }

  movetojobdetail() {
    this.router.navigate(['/jobs/public/', this.slug])
  }
  Makefavorite(event: Event) {
    event.stopPropagation()
    this.favourite = !this.favourite
  }
  getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th' // All days between 4 and 20 end with 'th'
    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }
}

// id: string
// clientId: string
// providerId: string
// information: JobDescription
// paymentType: PaymentType
// budget: number
// paymentLog: Array<Payment> = []
// bscEscrow: boolean = false
// state: JobState
// actionLog: Array<IJobAction> = []
// boostVisibility = false
// reviewId: string
// deadline: string
// visibility: string
// draft: boolean
// slug: string
// createAt: number
// updateAt: number
// invites: string[] = []
