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

const HITS_PER_PAGE = 5

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  hits = [] // the new hits array, injected into result component

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

  ratingFilter: number[] = []
  // rating filters on provider, union (OR)

  experienceFilter: string[] = []
  // experience filters on provider, intersection (AND)
  fixedFilter: number[] = []

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
    private location: Location
  ) {}

  async ngOnInit() {
    /*
    now sync the search with algolia if we have a search query
    if we don't have a search query we have to show a different message,
    different from no results
    */
    // get current query from url
    let currentPath = this.location.path()
    let splittedPath = currentPath.split('?')
    let currentQuery = splittedPath[splittedPath.length - 1]
    
    this.stats = { count: '0', usd: '0' }
    this.publicJobSubscription = this.publicJobService
      .getAllOpenJobs()
      .subscribe((result) => {
        this.allProviders = result
        this.filteredProviders = result

        this.hits = this.getHits()
        this.numHits = this.allProviders.length
        
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
    })
  }

  getHits() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false
    }, 2000);
    return this.filteredProviders.slice(
      this.currentPage * this.hitsPerPage,
      this.currentPage * this.hitsPerPage + this.hitsPerPage
    )
  }

  additemToFilteredProviders(provider: any) {
    if (this.filteredProviders.length === 0) {
      this.filteredProviders.push(provider)
    } else
      this.filteredProviders.map((item) => {
        if (item.id !== provider.id) {
          this.filteredProviders.push(provider)
        }
      })
  }
  // Refresh the search results
  async refreshResultsSearch() {
    // search Category
   
    this.filteredProviders = []

    if (this.skillsFilter.length > 0) {
      this.allProviders.map((provider) => {
        provider.information.skills.map((skill) => {
          if (this.compareWithArray(this.skillsFilter, skill)) {
            this.filteredProviders.push(provider)
          }
        })
      })
    }

    // search Fixed
    
    if (this.fixedFilter.length) {
      if (this.fixedFilter[0] == -1 && this.fixedFilter.length == 1) {
        this.allProviders.map((provider) => {
          if (provider.paymentType == 'Fixed price') {
            this.filteredProviders.push(provider)
          }
        })
      } else {
        this.allProviders.map((provider) => {
          if (
            this.fixedFilter.length > 0 &&
            provider.paymentType == 'Fixed price'
          ) {
            this.fixedFilter.map((item) => {
              if (item === 0) {
                if (provider.budget > 0 && provider.budget < 500) {
                  this.additemToFilteredProviders(provider)
                }
              }
              if (item === 500) {
                if (provider.budget > 500 && provider.budget < 1000) {
                  this.additemToFilteredProviders(provider)
                }
              }
              if (item === 1000) {
                if (provider.budget > 1000 && provider.budget < 5000) {
                  this.additemToFilteredProviders(provider)
                }
              }
              if (item === 5000) {
                if (provider.budget > 5000 && provider.budget < 10000) {
                  this.additemToFilteredProviders(provider)
                }
              }
              if (item === 10000) {
                if (provider.budget > 10000) {
                  this.additemToFilteredProviders(provider)
                }
              }
            })
          }
        })
      }
    }

    this.currentPage = 0
    this.hits = this.getHits()
    this.numHits = this.filteredProviders.length

    if (this.searchitems.length === 0) {
      this.hits = this.allProviders
    }
  }
  // two way binding, event from paging component (user input)
  onPageChange(newPage: number) {
    this.currentPage = newPage // set new page position
    this.hits = this.getHits()
  }

  onLocationChange(locationInput: string[]) {
    // we don't sort it to avoid ui changes, we'll sort it on the fly when composing status into address bar

    this.locationFilter = locationInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  // two way binding, event from child (user input)
  onVerifyFormChange(verifyInput: string[]) {
    // we don't need to sort it, it's only one value

    this.verifyFilter = verifyInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  // two way binding, event from child (user input)
  onHourlyInputChange(hourlyInput: string[]) {
    let normalizedHourly = [] // clean up it a bit
    hourlyInput.forEach((hourlyRange) => {
      let cleanedRange = hourlyRange.split('$').join('').split(' ').join('')
      normalizedHourly.push(cleanedRange)
    })
    // sort it to have a predictable string
    normalizedHourly.sort()

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

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

  // two way binding, event from child (user input)
  onRatingChange(ratingInput: number[]) {
    this.ratingFilter = ratingInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
  }

  // two way binding, event from child (user input)
  onSearchInputChange(searchInput: string) {
    this.searchInput = searchInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
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
    return scopeItem ? scopeItem.scope : 'Fixed'
  }
  getIdByScope(scope: string): number | undefined {
    const scopeItem = FilterService.fixedscope.find(
      (item) => item.scope === scope
    )
    return scopeItem ? scopeItem.id : -1
  }

  // Search Item above jobs card

  onChangeSearchItemFixed(item: any[]) {
    let uniqueFixed
    if (this.fixedFilter.length < item.length)
      this.searchitems.push(this.getScopeById(item.slice(-1)[0]))
    else {
      uniqueFixed = this.fixedFilter.filter(
        (fixed) => !item.includes(this.getScopeById(fixed))
      )
      this.searchitems.splice(
        this.searchitems.indexOf(this.getScopeById(uniqueFixed[0])),
        1
      )
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

  onRemoveSearchItem(removeItem: string) {
    this.searchitems.splice(this.searchitems.indexOf(removeItem), 1)

    this.skillsFilter.splice(this.skillsFilter.indexOf(removeItem), 1)
    this.fixedFilter.splice(
      this.fixedFilter.indexOf(this.getIdByScope(removeItem)),
      1
    )
    console.log(this.fixedFilter)

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    this.refreshResultsSearch()
  }
}
