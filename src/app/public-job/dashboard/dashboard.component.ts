import { Component, OnInit, Directive, OnDestroy } from '@angular/core'
import { PublicJobService } from '@service/public-job.service'
import { StatisticsService } from '@service/statistics.service'
import { AuthService } from '@service/auth.service'
import { NavService } from '@service/nav.service'
import { Job, JobDescription, JobState, PaymentType } from '@class/job'
// import { OrderPipe } from 'ngx-order-pipe'
import { Subscription } from 'rxjs'
import { User, UserType } from '@class/user'
import { NgxPaginationModule } from 'ngx-pagination'
// search
import { ActivatedRoute, Router } from '@angular/router'
import * as union from 'lodash/union'
import algoliasearch from 'algoliasearch/lite'
import { environment } from '../../../environments/environment'
import { Location } from '@angular/common'
import * as moment from 'moment-timezone'
const HITS_PER_PAGE = 9

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
  ) {
    this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
      this.searchInput = decodeURIComponent(params['query'] || '')
      this.providerFilters = JSON.parse(
        decodeURIComponent(params['providers'] || '[]')
      )

      this.verifyFilter = JSON.parse(
        decodeURIComponent(params['verify'] || '[]')
      )

      this.locationFilter = JSON.parse(
        decodeURIComponent(params['location'] || '[]')
      )

      this.skillsFilter = JSON.parse(
        decodeURIComponent(params['skills'] || '[]')
      )

      this.experienceFilter = JSON.parse(
        decodeURIComponent(params['experience'] || '[]')
      )
      this.ratingFilter = JSON.parse(
        decodeURIComponent(params['rating'] || '[]')
      )
      this.searchitems = this.skillsFilter
      if (this.ratingFilter.length) {
        this.searchitems.push('houly')
      }
      this.currentPage = JSON.parse(decodeURIComponent(params['page'] || 0))
    })
  }

  async ngOnInit() {
    this.algoliaSearch = algoliasearch(
      environment.algolia.appId,
      environment.algolia.apiKey
    )
    this.algoliaSearchClient = this.algoliaSearch.initIndex(
      environment.algolia.indexJobName
    )

    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
      }
    })
    this.navService.setHideSearchBar(true) // obsolete?

    /*
    now sync the search with algolia if we have a search query
    if we don't have a search query we have to show a different message,
    different from no results
    */
    // get current query from url
    let currentPath = this.location.path()
    let splittedPath = currentPath.split('?')
    let currentQuery = splittedPath[splittedPath.length - 1]
    //console.log("currentQuery: "+currentQuery);

    this.algoliaQuery(currentQuery)

    this.stats = { count: '0', usd: '0' }
    // this.publicJobSubscription = this.publicJobService
    //   .getAllOpenJobs()
    //   .subscribe((result) => {
    //     this.allProviders = result
    //     this.filteredProviders = result
    //   })

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

  algoliaQuery(newQuery) {
    if (
      !this.searchInput &&
      this.providerFilters.length == 0 &&
      this.verifyFilter.length == 0 &&
      this.skillsFilter.length == 0 &&
      this.ratingFilter.length == 0 &&
      this.locationFilter.length == 0 &&
      this.experienceFilter.length == 0
    ) {
      this.loading = false
      this.currentQueryString = newQuery // update internal state
      this.numHits = 0 // reset
      return
    }
    if (this.loading) return // avoid overlapping searches
    this.loading = true

    let newArray = []
    let algoliaSearchObject = <any>{}
    /* 
      https://www.algolia.com/doc/api-reference/search-api-parameters/
      hitsPerPage and page
    */
    algoliaSearchObject.hitsPerPage = this.hitsPerPage // constant
    algoliaSearchObject.page = this.currentPage

    // facet filters
    // https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/#and-and-or-filter-combination

    if (
      this.providerFilters.length > 0 ||
      this.verifyFilter.length > 0 ||
      this.locationFilter.length > 0 ||
      this.experienceFilter.length > 0
    ) {
      // https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/
      algoliaSearchObject.facetFilters = []

      let currentFacetFiltersIndex = -1

      if (this.providerFilters.length > 0) {
        algoliaSearchObject.facetFilters.push([])

        currentFacetFiltersIndex = algoliaSearchObject.facetFilters.length - 1
        // provider type
        this.providerFilters.forEach((providerName) => {
          algoliaSearchObject.facetFilters[currentFacetFiltersIndex].push(
            `category:${providerName}`
          )
        }) // OR
      }

      // verified (AND)
      if (this.verifyFilter.length > 0 && this.verifyFilter[0] == 'Verified') {
        algoliaSearchObject.facetFilters.push(`verified:true`) // this filter is a string, not an array
      }

      // filter on countries,timezones (AND)
      if (this.locationFilter.length > 0) {
        algoliaSearchObject.facetFilters.push([])

        currentFacetFiltersIndex = algoliaSearchObject.facetFilters.length - 1
        // get possibile timezone list for every selected country
        this.locationFilter.forEach((countryCode) => {
          let timezones = moment.tz.zonesForCountry(countryCode)

          // union of all countries selected
          timezones.forEach((timezone) => {
            algoliaSearchObject.facetFilters[currentFacetFiltersIndex].push(
              `timezone:${timezone}`
            )
          }) // OR
        })
      }
    }

    // let's compose the algolia rating filter string
    if (this.ratingFilter.length > 0) {
      let ratingFilterString = ''

      this.ratingFilter.forEach((rating) => {
        if (ratingFilterString.length > 0) ratingFilterString += ` OR `

        // rating range
        ratingFilterString += `((rating.average >= ${rating}) AND (rating.average < ${
          rating + 1
        }))`
      }) // OR

      if (algoliaSearchObject.filters) {
        // there are also hourly filters, we should and with it
        if (this.ratingFilter.length == 1) {
          // only one, no need of more ()
          algoliaSearchObject.filters = `(${algoliaSearchObject.filters}) AND ${ratingFilterString}`
        } else {
          algoliaSearchObject.filters = `(${algoliaSearchObject.filters}) AND (${ratingFilterString})`
        }
      } else {
        algoliaSearchObject.filters = ratingFilterString
      }
    }

    /* 
      we merge skills query with free text query
      for maximum results with skills query on all provider profile
      the skills query is in AND with free text and this is correct
      also the skills will be in AND each other, we'll search all
    */
    let skillsQuery = ''
    if (this.skillsFilter.length > 0) {
      this.skillsFilter.forEach((skill) => {
        if (skillsQuery) skillsQuery += ' '
        skillsQuery += skill
      })
    }

    let searchQuery = this.searchInput
    // free text + skills

    if (skillsQuery) {
      if (searchQuery) searchQuery = `${searchQuery} ${skillsQuery}`
      else searchQuery = skillsQuery
    }

    // experience  level
    let experienceQuery = ''
    if (this.experienceFilter.length > 0) {
      this.experienceFilter.forEach((skill) => {
        if (experienceQuery) experienceQuery += ' '
        experienceQuery += skill
      })
    }

    algoliaSearchObject.experienceFilter = experienceQuery

    //console.log('algoliaSearchObject: ', algoliaSearchObject)
    this.algoliaSearchClient
      .search(searchQuery, algoliaSearchObject)
      .then((res) => {
        const result = res.hits
        console.log('result: ', result)
        for (let i = 0; i < result.length; i++) {
          if (result[i]) {
            let avatar = result[i].avatar // current, retrocomp
            //console.log(result[i])
            if (
              result[i].compressedAvatarUrl &&
              result[i].compressedAvatarUrl != 'new'
            ) {
              // keep same object structure
              // use compress thumbed if exist and not a massive update (new)
              avatar = {
                uri: result[i].compressedAvatarUrl,
              }
            }
            const provider = {
              id: i,
              address: result[i].address,
              avatarUri: avatar.uri, // new
              skillTags: result[i].skillTags || [],
              title: result[i].title,
              name: result[i].name,
              category: result[i].category,
              bio: result[i].bio,
              timezone: result[i].timezone,
              hourlyRate: result[i].hourlyRate || 0,
              rating: result[i].rating,
              slug: result[i].slug,
              verified: result[i].verified,
            }
            newArray.push(provider)
          }
        }
        // newArray.sort((a, b) => b.ratingCount - a.ratingCount)
        this.hits = newArray // update
        this.numHits = res.nbHits
        this.loading = false
        this.currentQueryString = newQuery // to avoid searching 2 times same string
      })
      .catch((err) => {
        this.loading = false
        console.log(err)
      })
    //console.log(this.tempProviderArray)
  }

  syncAddressBar() {
    // do not affect injected status, let's do a copy

    const sortedLocations = this.locationFilter.concat().sort() // sort to a copy, predictable string
    const sortedSkills = this.skillsFilter.concat().sort() // sort to a copy, predictable string
    const sortedRating = this.ratingFilter.concat().sort() // sort to a copy, predictable string
    const experienceLevel = this.experienceFilter.concat().sort() // sort to a copy, predictable string
    let newQueryString = `query=${encodeURIComponent(
      this.searchInput
    )}&providers=${encodeURIComponent(
      JSON.stringify(this.providerFilters)
    )}&location=${encodeURIComponent(
      JSON.stringify(sortedLocations)
    )}&skills=${encodeURIComponent(
      JSON.stringify(sortedSkills)
    )}&rating=${encodeURIComponent(
      JSON.stringify(sortedRating)
    )}&level=${encodeURIComponent(
      JSON.stringify(experienceLevel)
    )}&page=${encodeURIComponent(
      JSON.stringify(this.currentPage)
    )}&verify=${encodeURIComponent(JSON.stringify(this.verifyFilter))}`
    this.location.go('jobs', newQueryString)
    return newQueryString
  }

  refreshResultsIfNeeded(newQuery) {
    // handle also the encode uri scenario when accessing directly the url
    if (
      this.currentQueryString != newQuery &&
      this.currentQueryString != encodeURI(newQuery)
    ) {
      // cool, we have to refresh search

      /*
      refresh the algolia query, with a 400ms latency to avoid overloading
      and a searchInProgress flag to avoid overalapping multiple calls
      handle also the search on explicit button input for faster click users
      */
      setTimeout(() => {
        this.algoliaQuery(newQuery)
        // if another is running this will end immediately
      }, 400) // 500 ms latency
    } else {
      console.log('up to date') // debug, check this well better later when we add other search facets
    }
  }

  // two way binding, event from paging component (user input)
  onPageChange(newPage: number) {
    this.currentPage = newPage // set new page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onLocationChange(locationInput: string[]) {
    // we don't sort it to avoid ui changes, we'll sort it on the fly when composing status into address bar

    this.locationFilter = locationInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onVerifyFormChange(verifyInput: string[]) {
    // we don't need to sort it, it's only one value

    this.verifyFilter = verifyInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
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

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onSkillsFilterChange(skillInput: string[]) {
    // Set the search items with last time we checked

    this.onChangeSearchItem(skillInput);

    this.skillsFilter = skillInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // update the search items
  

  onExperienceFormChange(experienceInput: string[]) {
    this.experienceFilter = experienceInput
    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position
    const newQueryString = this.syncAddressBar()
    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onRatingChange(ratingInput: number[]) {
    this.ratingFilter = ratingInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onSearchInputChange(searchInput: string) {
    this.searchInput = searchInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onProviderFiltersChange(providerTypes: any) {
    let sortedProviders = providerTypes
    sortedProviders = providerTypes.sort() // sort to have a predictable string
    this.providerFilters = sortedProviders

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  ngOnDestroy() {
    this.navService.setHideSearchBar(false)
    if (this.routeSub) {
      this.routeSub.unsubscribe()
    }

    this.publicJobSubscription.unsubscribe()
  }
  /* obsolete
  algoliaSearchChanged(query) {
    this.query = String(query)
  }
  */
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

  onChangeSearchItem(Input:any[]){
    if (this.skillsFilter.length < Input.length)
      this.searchitems.push(Input.slice(-1)[0])
    else{
      const uniqueSkills = this.skillsFilter.filter(skill => !Input.includes(skill));
      this.searchitems.splice(this.searchitems.indexOf(uniqueSkills[0]), 1)
    }
  }

  onRemoveSearchItem(removeItem: string) {
    const uniqueitem = this.searchitems.indexOf(removeItem)
    this.searchitems.splice(uniqueitem, 1)

    this.skillsFilter.splice(uniqueitem, 1)

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }
}
