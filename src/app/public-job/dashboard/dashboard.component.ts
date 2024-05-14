import { Component, OnInit, Directive } from '@angular/core'
import { PublicJobService } from '@service/public-job.service'
import { StatisticsService } from '@service/statistics.service'
import { AuthService } from '@service/auth.service'
import { NavService } from '@service/nav.service'
import { Job, JobDescription, JobState, PaymentType } from '@class/job'
// import { OrderPipe } from 'ngx-order-pipe'
import { Subscription } from 'rxjs'
import { User, UserType } from '@class/user'
import { NgxPaginationModule } from 'ngx-pagination'

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  searchInput: string = '' // the new search input text, this is the model on parent
  providerFilters = [] // the current active provider type filters (union)

  verifyFilter: string[] = [] // the current verified provider filter

  skillsFilter: string[] = []
  // skill filters on provider, intersection (AND)

  ratingFilter: number[] = []
  // rating filters on provider, union (OR)

  // two way binding, event from child (user input)
  onSearchInputChange(searchInput: string) {
    this.searchInput = searchInput

    // this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // // keep in sync also address bar, without refreshing page
    // const newQueryString = this.syncAddressBar()

    // this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onProviderFiltersChange(providerTypes: any) {
    let sortedProviders = providerTypes
    sortedProviders = providerTypes.sort() // sort to have a predictable string
    this.providerFilters = sortedProviders

    // this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // // keep in sync also address bar, without refreshing page
    // const newQueryString = this.syncAddressBar()

    // this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onVerifyFormChange(verifyInput: string[]) {
    // we don't need to sort it, it's only one value

    this.verifyFilter = verifyInput

    // this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // // keep in sync also address bar, without refreshing page
    // const newQueryString = this.syncAddressBar()

    // this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onSkillsFilterChange(skillInput: string[]) {
    this.skillsFilter = skillInput

    // this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // // keep in sync also address bar, without refreshing page
    // const newQueryString = this.syncAddressBar()

    // this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onRatingChange(ratingInput: number[]) {
    this.ratingFilter = ratingInput

    // this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // // keep in sync also address bar, without refreshing page
    // const newQueryString = this.syncAddressBar()

    // this.refreshResultsIfNeeded(newQueryString)
  }

  // bad-code
  loading = false

  allJobs: any
  queryJobs: any
  stats: any
  authSub: Subscription
  currentUser: User
  orderType = 'actionLog[0].timestamp'
  index = 1
  reverseOrder = true
  filterByCategory: any
  publicJobSubscription: any
  paymentType = PaymentType
  providerTypes = [
    {
      name: 'All Jobs',
      img: 'writer.svg',
      id: 'all',
    },
    {
      name: 'Content Creators',
      img: 'writer.svg',
      id: 'contentCreator',
    },
    {
      name: 'Software Developers',
      img: 'dev.svg',
      id: 'softwareDev',
    },
    {
      name: 'Designers & Creatives',
      img: 'creatives.svg',
      id: 'designer',
    },
    {
      name: 'Marketing & SEO',
      img: 'marketing.svg',
      id: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.svg',
      id: 'virtualAssistant',
    },
  ]

  constructor(
    private publicJobService: PublicJobService,
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private navService: NavService //    private order: OrderPipe
  ) {}

  async ngOnInit() {
    this.stats = { count: '0', usd: '0' }
    this.filterByCategory = 'all'
    this.orderType = 'information.title'
    this.navService.setHideSearchBar(true)
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.publicJobSubscription = this.publicJobService
      .getAllOpenJobs()
      .subscribe((result) => {
        this.allJobs = result
        this.queryJobs = this.allJobs
      })

    // retrieve and aggregate job stats
    let jobStats, publicJobStats: any
    this.statisticsService.getStatistics().subscribe((result) => {
      result.forEach((obj) => {
        if (obj.name === 'publicJobs') publicJobStats = obj
        if (obj.name === 'jobs') jobStats = obj
      })
      this.stats = {
        count: jobStats.count + publicJobStats.count,
        usd: Math.round(jobStats.usd + publicJobStats.usd),
      }
      console.log('jobStats:', jobStats)
      console.log('publicJobStats:', publicJobStats)
    })
  }

  async ngOnDestroy() {
    this.publicJobSubscription.unsubscribe()
  }

  get isProvider(): boolean {
    return this.currentUser.type === UserType.provider
  }
  timestampToDate(timestamp) {
    const date = new Date(parseInt(timestamp, 10)).toLocaleDateString()
    return date
  }
  onKeyUp(event: any) {
    this.onSearch(event)
  }

  onSearch(query: string) {
    if (query !== '') {
      const tmpJobs: any = []
      this.allJobs.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
          tmpJobs.push(item)
        }
      })
      //console.log(tmpJobs)
      this.queryJobs = tmpJobs
    } else {
      this.queryJobs = this.allJobs
    }
  }

  filterJobsByCategory() {
    //console.log(this.filterByCategory)
    if (this.filterByCategory !== 'all') {
      this.queryJobs = this.allJobs.filter(
        (job) => job.information.providerType === this.filterByCategory
      )
    } else {
      this.queryJobs = this.allJobs
    }
  }

  getImage(string) {
    let url = 'assets/img/providers/'
    const type = this.providerTypes.find((prov) => prov.id === string)
    url = url + type.img
    return url
  }
}
