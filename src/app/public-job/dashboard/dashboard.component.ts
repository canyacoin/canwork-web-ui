import { Component, OnInit, Directive, OnDestroy } from '@angular/core'
import { PublicJobService } from '@service/public-job.service'
import { StatisticsService } from '@service/statistics.service'
import { AuthService } from '@service/auth.service'
import { NavService } from '@service/nav.service'
// import { OrderPipe } from 'ngx-order-pipe'
import { Subscription } from 'rxjs'
import { User } from '@class/user'
// search
import { ActivatedRoute, Router } from '@angular/router'
import * as union from 'lodash/union'
import { Location } from '@angular/common'

import { FilterService } from 'app/shared/constants/public-job-dashboard-page'
import { UserService } from '@service/user.service'

const HITS_PER_PAGE = 5

interface SoringMethod {
  name: string
  code: string
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  hits = [] // the new hits array, injected into result component

  sortby: SoringMethod
  // jobs
  stats: any
  currentUser: User
  authSub: Subscription
  publicJobSubscription: Subscription
  /*
  invoke directly algolia search api
  create input field and handle on change
  on change invoke api and populate hits
  re create paginating component
  re create timezone flag
  
  reuse ais custom styling classes from css
  */
  searchInput: string = '' // the new search input text, this is the model on parent
  providerFilters = [] // the current active provider type filters (union)

  verifyFilter: string[] = [] // the current verified provider filter

  locationFilter: string[] = [] // the current location list filter (or)

  currentQueryString: string = '' // the current search on query parameters combination

  skillsFilter: string[] = []
  // skill filters on provider, intersection (AND)

  categoryFilter: any[] = []
  // category filters on provider, intersection (AND)

  ratingFilter: number[] = []
  // rating filters on provider, union (OR)

  experienceFilter: string[] = []
  // experience filters on provider, intersection (AND)
  fixedFilter: number[] = []

  hourlyFilter: number[] = []

  currentPage: number = 0 // the current search page
  numHits: number = 0 // the number of hits of current search
  hitsPerPage: number = HITS_PER_PAGE // constant

  query: string
  categoryQuery = ''
  hourlyQuery = ''
  loading = false
  minValue = 0
  maxValue = 300

  routeSub: Subscription
  private algoliaSearch // new
  private algoliaSearchClient // new

  // Search parameters
  searchitems: string[] = []

  allProviders: any[] = []
  filteredProviders: any[] = []
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    // job search
    private publicJobService: PublicJobService,
    private statisticsService: StatisticsService,
    private authService: AuthService,
    private navService: NavService, //    private order: OrderPipe
    private location: Location,
    private userService: UserService
  ) {}

  async ngOnInit() {
    /*
    now sync the search with algolia if we have a search query
    if we don't have a search query we have to show a different message,
    different from no results
    */
    // get current query from url
    this.loading = true
    let currentPath = this.location.path()
    let splittedPath = currentPath.split('?')
    let currentQuery = splittedPath[splittedPath.length - 1]

    this.stats = { count: '0', usd: '0' }
    this.publicJobSubscription = this.publicJobService
      .getAllOpenJobs()
      .subscribe((result) => {
        console.log('result: ', result)
        let activeJobs = result.filter((job) => job.draft === false)
        this.allProviders = activeJobs
        this.filteredProviders = activeJobs

        console.log('activeJobs: ', activeJobs)

        this.hits = this.getHits()
        this.numHits = this.allProviders.length
        this.hits = this.hits.sort(
          (a, b) =>
            new Date(b.updateAt).getTime() - new Date(a.updateAt).getTime()
        )
      })

    // retrieve and aggregate job stats

    this.sortby = { name: 'Newest', code: 'newest' }

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
    })

    this.loading = false
  }

  getHits() {
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, 1000)
    return this.filteredProviders.slice(
      this.currentPage * this.hitsPerPage,
      this.currentPage * this.hitsPerPage + this.hitsPerPage
    )
  }
  // Refresh the search results
  async refreshResultsSearch() {
    this.filteredProviders = []

    let SearchResultJobs = this.allProviders
    // search Category
    if (this.categoryFilter.length > 0) {
      SearchResultJobs.map((provider) => {
        this.categoryFilter.map((item) => {
          if (item === provider.information.providerType) {
            this.filteredProviders.push(provider)
          }
        })
      })
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }
    // search skills

    if (this.skillsFilter.length > 0) {
      SearchResultJobs.map((provider) => {
        provider.information.skills.map((skill) => {
          if (this.compareWithArray(this.skillsFilter, skill)) {
            this.filteredProviders.push(provider)
          }
        })
      })

      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }

    // search Fixed

    if (this.fixedFilter.length) {
      if (this.fixedFilter[0] == -1 && this.fixedFilter.length == 1) {
        SearchResultJobs.map((provider) => {
          if (provider.paymentType == 'Fixed price') {
            this.filteredProviders.push(provider)
          }
        })
      } else {
        SearchResultJobs.map((provider) => {
          if (
            this.fixedFilter.length > 0 &&
            provider.paymentType == 'Fixed price'
          ) {
            this.fixedFilter.map((item) => {
              if (item === 0) {
                if (provider.budget > 0 && provider.budget < 500) {
                  this.filteredProviders.push(provider)
                }
              }
              if (item === 500) {
                if (provider.budget > 500 && provider.budget < 1000) {
                  this.filteredProviders.push(provider)
                }
              }
              if (item === 1000) {
                if (provider.budget > 1000 && provider.budget < 5000) {
                  this.filteredProviders.push(provider)
                }
              }
              if (item === 5000) {
                if (provider.budget > 5000 && provider.budget < 10000) {
                  this.filteredProviders.push(provider)
                }
              }
              if (item === 10000) {
                if (provider.budget > 10000) {
                  this.filteredProviders.push(provider)
                }
              }
            })
          }
        })
      }
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }

    // Search Hourly
    if (this.hourlyFilter.length > 0) {
      if (this.hourlyFilter[0] == 0 && this.hourlyFilter[1] === 0) {
        SearchResultJobs.map((provider) => {
          if (provider.paymentType == 'Hourly price') {
            this.filteredProviders.push(provider)
          }
        })
      } else {
        this.minValue = Number.isNaN(this.hourlyFilter[0])
          ? 0
          : this.hourlyFilter[0]
        this.maxValue = Number.isNaN(this.hourlyFilter[1])
          ? 300
          : this.hourlyFilter[1]

        SearchResultJobs.map((provider) => {
          if (
            this.minValue <= provider.budget &&
            this.maxValue >= provider.budget
          ) {
            if (provider.paymentType == 'Hourly price') {
              this.filteredProviders.push(provider)
            }
          }
        })
      }
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }

    // Search Location

    if (this.locationFilter.length > 0) {
      this.loading = true
      SearchResultJobs.map(async (provider) => {
        const jobPoster = await this.userService.getUser(provider.clientId)
        const location_client = jobPoster.timezone
        this.locationFilter.map((item) => {
          if (location_client.toLowerCase().includes(item.toLowerCase())) {
            this.filteredProviders.push(provider)
          }
        })
      })
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }

    if (this.ratingFilter.length > 0) {
      this.loading = true
      SearchResultJobs.map(async (provider) => {
        const jobPoster = await this.userService.getUser(provider.clientId)
        this.ratingFilter.map((item) => {
          console.log('jobPoster.rating.average', jobPoster.rating.average)

          if (item === Math.trunc(jobPoster.rating.average)) {
            this.filteredProviders.push(provider)
          }
        })
      })
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }

    // Search input on the top
    if (this.searchInput.length > 0) {
      this.loading = true

      SearchResultJobs.map(async (provider) => {
        let tempText = provider.information.title
        tempText += this.stripHtmlTags(provider.information.description)
        tempText += provider.information.skills.join(' ')

        if (tempText.toLowerCase().includes(this.searchInput.toLowerCase())) {
          this.filteredProviders.push(provider)
        }
      })
      SearchResultJobs = this.filteredProviders
      this.filteredProviders = []
    }
    this.currentPage = 0

    // array for filtering
    this.filteredProviders = SearchResultJobs

    this.SortbymethodHandler()

    if (
      this.searchitems.includes('Location') ||
      this.searchitems.includes('Rating')
    ) {
      setTimeout(() => {
        this.hits = this.getHits()
        this.numHits = this.filteredProviders.length
        this.loading = false
      }, 3000)
    } else {
      this.hits = this.getHits()
      this.numHits = this.filteredProviders.length
      this.loading = false
    }
  }

  stripHtmlTags(html: string): string {
    // Create a new DOM element to use the browser's parsing capabilities
    const div = document.createElement('div')

    // Assign the HTML string to the innerHTML of the created element
    div.innerHTML = html

    // Use the textContent property to get the plain text without HTML tags
    return div.textContent || div.innerText || ''
  }

  SortbymethodHandler() {
    if (this.sortby.code === 'budgetup') {
      this.filteredProviders.sort((a, b) => a.budget - b.budget)
    } else if (this.sortby.code === 'budgetdown') {
      this.filteredProviders.sort((a, b) => b.budget - a.budget)
    } else if (this.sortby.code === 'newest') {
      this.filteredProviders = this.filteredProviders.sort((a, b) => {
        return new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
      })
    }
  }
  // two way binding, event from paging component (user input)
  onPageChange(newPage: number) {
    this.currentPage = newPage // set new page position
    this.hits = this.getHits()
  }

  onLocationInputChange(locationInput: string[]) {
    // we don't sort it to avoid ui changes, we'll sort it on the fly when composing status into address bar
    if (locationInput.length == 0) {
      this.searchitems.splice(this.searchitems.indexOf('Location'), 1)
    }
    if (locationInput.length > 0 && !this.searchitems.includes('Location')) {
      this.searchitems.push('Location')
    }
    this.locationFilter = locationInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }

  // two way binding, event from child (user input)
  onVerifyFormChange(verifyInput: string[]) {
    // we don't need to sort it, it's only one value

    this.verifyFilter = verifyInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  // two way binding, event from child (user input)
  toLowerCaseArray(arr: string[]): string[] {
    return arr.map((str) => str.toLowerCase())
  }

  compareWithArray(arr: string[], compareStr: string): boolean {
    const lowerCaseArray = this.toLowerCaseArray(arr)
    const lowerCaseCompareStr = compareStr.toLowerCase()
    return lowerCaseArray.includes(lowerCaseCompareStr)
  }

  onSkillsFilterChange(skillInput: string[]) {
    // Set the search items with last time we checked
    this.onChangeSearchItemskill(skillInput)
    this.skillsFilter = skillInput
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }

  onCategoryFilterChange(categoryInput: any[]) {
    this.onChangeSearchItemCategory(categoryInput)
    this.categoryFilter = categoryInput
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }
  onChangeSoryby(sort: SoringMethod) {
    this.sortby = sort
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }
  // update the search items

  onExperienceFormChange(experienceInput: string[]) {
    this.experienceFilter = experienceInput
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  onFixedFormChange(fixedFilterInput: number[]) {
    this.onChangeSearchItemFixed(fixedFilterInput)
    this.fixedFilter = fixedFilterInput
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }

  onHourlyInputChange(FilterInput: number[]) {
    this.onChangeSearchItemHourly(FilterInput)

    this.hourlyFilter = FilterInput
    this.currentPage = 0
    this.refreshResultsSearch()
  }
  // two way binding, event from child (user input)
  onRatingChange(ratingInput: number[]) {
    if (ratingInput.length == 0) {
      this.searchitems.splice(this.searchitems.indexOf('Rating'), 1)
    }
    if (ratingInput.length > 0 && !this.searchitems.includes('Rating')) {
      this.searchitems.push('Rating')
    }

    this.ratingFilter = ratingInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }

  // two way binding, event from child (user input)
  onSearchInputChange(searchInput: string) {
    this.searchInput = searchInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }

  // two way binding, event from child (user input)
  onProviderFiltersChange(providerTypes: any) {
    let sortedProviders = providerTypes
    sortedProviders = providerTypes.sort() // sort to have a predictable string
    this.providerFilters = sortedProviders

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  ngOnDestroy() {
    this.navService.setHideSearchBar(false)
    if (this.routeSub) {
      this.routeSub.unsubscribe()
    }
  }

  isInArray(value, array: any[]) {
    if (array.indexOf(value) > -1) {
      return true
    } else {
      return false
    }
  }

  getProviderTags(provider: any): string[] {
    const allTags: string[] = union(
      provider.skillTags === undefined ? [] : provider.skillTags,
      provider.workSkillTags === undefined ? [] : provider.workSkillTags
    )
    if (allTags.length > 5) {
      const moreSymbol = '+ ' + (allTags.length - 5) + ' more'
      const arr = allTags.slice(0, 5)
      return arr.concat([moreSymbol])
    }
    return allTags
  }

  // job

  timestampToDate(timestamp) {
    const date = new Date(parseInt(timestamp, 10)).toLocaleDateString()
    return date
  }

  // get Fixed Scope and ID from...
  getScopeById(id: number): string | undefined {
    const scopeItem = FilterService.fixedscope.find((item) => item.id === id)
    return scopeItem !== undefined ? scopeItem.scope : 'Fixed'
  }
  getIdByScope(scope: string): number | undefined {
    const scopeItem = FilterService.fixedscope.find(
      (item) => item.scope === scope
    )
    return scopeItem !== undefined ? scopeItem.id : -1
  }

  // Search Item above jobs card

  onChangeSearchItemFixed(item: any[]) {
    let uniqueFixed
    if (item.includes(-1) && !this.searchitems.includes('Fixed')) {
      this.searchitems.push('Fixed')
    }

    if (this.fixedFilter.length < item.length)
      this.searchitems.push(this.getScopeById(item.slice(-1)[0]))
    else {
      uniqueFixed = this.fixedFilter.filter((fixed) => !item.includes(fixed))
      this.searchitems.splice(
        this.searchitems.indexOf(this.getScopeById(uniqueFixed[0])),
        1
      )
    }
    if (item.length == 0) {
      FilterService.fixedscope.map((item) => {
        this.searchitems = this.searchitems.splice(
          this.searchitems.indexOf(item.scope),
          1
        )
      })
    }
  }

  onChangeSearchItemHourly(FilterInput: number[]) {
    if (FilterInput.length) {
      if (!this.searchitems.includes('hourly')) {
        this.searchitems.push('hourly')
      }
    } else {
      this.searchitems.splice(this.searchitems.indexOf('hourly'), 1)
    }
  }

  onChangeSearchItemskill(Input: any[]) {
    if (this.skillsFilter.length < Input.length)
      this.searchitems.push(Input.slice(-1)[0])
    else {
      const uniqueSkills = this.skillsFilter.filter(
        (skill) => !Input.includes(skill)
      )
      this.searchitems.splice(this.searchitems.indexOf(uniqueSkills[0]), 1)
    }
  }

  onChangeSearchItemCategory(Input: any[]) {
    if (this.categoryFilter.length < Input.length) {
      this.searchitems.push(Input.slice(-1)[0])
    } else {
      const uniqueCategory = this.categoryFilter.filter(
        (skill) => !Input.includes(skill)
      )
      this.searchitems.splice(this.searchitems.indexOf(uniqueCategory[0]), 1)
    }
  }

  onRemoveSearchItem(removeItem: string) {
    this.searchitems.splice(this.searchitems.indexOf(removeItem), 1)
    this.categoryFilter.splice(this.categoryFilter.indexOf(removeItem), 1)
    this.skillsFilter.splice(this.skillsFilter.indexOf(removeItem), 1)

    if (removeItem == 'Location') {
      this.locationFilter = []
    }
    if (removeItem == 'hourly') {
      this.hourlyFilter = []
    }
    if (removeItem == 'Fixed') {
      this.fixedFilter = []
      FilterService.fixedscope.map((item) => {
        this.searchitems = this.searchitems.splice(
          this.searchitems.indexOf(item.scope),
          1
        )
      })
    } else {
      this.fixedFilter.splice(
        this.fixedFilter.indexOf(this.getIdByScope(removeItem)),
        1
      )
    }

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }
}
