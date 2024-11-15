import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import * as union from 'lodash/union'
import { LabelType, Options } from 'ngx-slider-v2'
import { Observable, Subscription } from 'rxjs'
import algoliasearch from 'algoliasearch/lite'
import { environment } from '../../environments/environment'
import { User, UserCategory } from '../core-classes/user'
import { AuthService } from '../core-services/auth.service'
import { NavService } from '../core-services/nav.service'
import { Location } from '@angular/common'
import * as moment from 'moment-timezone'
const HITS_PER_PAGE = 9

import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'app-search-page',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  // allProviders: User[] = []
  // filteredProviders: User[] = []
  // chosenFilters = []
  hits = [] // the new hits array, injected into result component
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
  hourlyFilters: string[] = []
  // range filters on provider hourly rate, the current active hourly rate range filters (union)

  skillsFilter: string[] = []
  // skill filters on provider, intersection (AND)

  ratingFilter: number[] = []
  // rating filters on provider, union (OR)

  hourlyFiltersInput: string[] = []
  // range filters on provider hourly rate, the input to send to child if we load from state route
  // this is slight different cause we format range in a simplified way into state controller

  currentPage: number = 0 // the current search page
  numHits: number = 0 // the number of hits of current search
  hitsPerPage: number = HITS_PER_PAGE // constant

  noSearchParams = false // there are no search params, we have to render this notice
  // injected into results component

  smallCards = true
  query: string
  categoryQuery = ''
  hourlyQuery = ''
  loading = false
  minValue = 0
  maxValue = 300
  options: Options = {
    floor: 0,
    ceil: 300,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return '<b>Min price:</b> $' + value
        case LabelType.High:
          return '<b>Max price:</b> $' + value
        default:
          return '$' + value
      }
    },
  }
  routeSub: Subscription
  providerSub: Subscription
  portfolioSub: Subscription
  //algoliaIndex = environment.algolia.indexName
  // rendering = false // obsolete
  inMyTimezone = true
  //algoliaSearchConfig: any
  authSub: any
  currentUser: User
  private algoliaSearch // new
  private algoliaSearchClient // new

  constructor(
    private activatedRoute: ActivatedRoute,
    private navService: NavService,
    private auth: AuthService,
    private router: Router,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
      this.searchInput = decodeURIComponent(params['query'] || '')
      this.providerFilters = JSON.parse(
        decodeURIComponent(params['providers'] || '[]')
      )
      this.hourlyFilters = JSON.parse(
        decodeURIComponent(params['hourly'] || '[]')
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

      this.ratingFilter = JSON.parse(
        decodeURIComponent(params['rating'] || '[]')
      )

      this.currentPage = JSON.parse(decodeURIComponent(params['page'] || 0))

      // let's sync on load hourly filters injected into child controller, different format
      let injectedHourlyFilters = []
      this.hourlyFilters.forEach((hourlyRange) => {
        let hourlyFilterInputString = ''

        // plain filter range
        if (hourlyRange.indexOf('-') != -1)
          hourlyFilterInputString = `$${hourlyRange.split('-').join(' - $')}`

        // filter greater then
        if (hourlyRange.indexOf('>') != -1)
          hourlyFilterInputString = `$${hourlyRange}`

        if (hourlyFilterInputString)
          injectedHourlyFilters.push(hourlyFilterInputString)
      })

      this.hourlyFiltersInput = injectedHourlyFilters // send it
    })
  }

  async ngOnInit() {
    this.algoliaSearch = algoliasearch(
      environment.algolia.appId,
      environment.algolia.apiKey
    )
    this.algoliaSearchClient = this.algoliaSearch.initIndex(
      environment.algolia.indexName
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
  }

  algoliaQuery(newQuery) {
    if (
      !this.searchInput &&
      this.providerFilters.length == 0 &&
      this.hourlyFilters.length == 0 &&
      this.verifyFilter.length == 0 &&
      this.skillsFilter.length == 0 &&
      this.ratingFilter.length == 0 &&
      this.locationFilter.length == 0
    ) {
      this.loading = false
      this.noSearchParams = true
      this.currentQueryString = newQuery // update internal state
      this.numHits = 0 // reset
      return
    }
    this.noSearchParams = false
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
      this.locationFilter.length > 0
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

    /*
      https://www.algolia.com/doc/api-reference/api-parameters/filters/
    */
    // hourlyRate range query
    //algoliaSearchObject.filters = `hourlyRate:0 TO 10 OR hourlyRate >= 50`

    // let's compose the algolia filter string
    if (this.hourlyFilters.length > 0) {
      let hourlyFilterString = ''

      this.hourlyFilters.forEach((hourlyRange) => {
        if (hourlyFilterString.length > 0) hourlyFilterString += ` OR `

        // plain filter range
        if (hourlyRange.indexOf('-') != -1)
          hourlyFilterString += `hourlyRate:${hourlyRange.replace('-', ' TO ')}`

        // filter greater then
        if (hourlyRange.indexOf('>') != -1)
          hourlyFilterString += `hourlyRate > ${hourlyRange.replace('>', '')}`
      }) // OR

      algoliaSearchObject.filters = hourlyFilterString
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
    this.algoliaSearchClient
      .search(searchQuery, algoliaSearchObject)
      .then((res) => {
        const result = res.hits
        //console.log(result)
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

    let newQueryString = `query=${encodeURIComponent(
      this.searchInput
    )}&providers=${encodeURIComponent(
      JSON.stringify(this.providerFilters)
    )}&hourly=${encodeURIComponent(
      JSON.stringify(this.hourlyFilters)
    )}&location=${encodeURIComponent(
      JSON.stringify(sortedLocations)
    )}&skills=${encodeURIComponent(
      JSON.stringify(sortedSkills)
    )}&rating=${encodeURIComponent(
      JSON.stringify(sortedRating)
    )}&page=${encodeURIComponent(
      JSON.stringify(this.currentPage)
    )}&verify=${encodeURIComponent(JSON.stringify(this.verifyFilter))}`
    this.location.go('search', newQueryString)
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
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.algoliaQuery(newQuery)
          // if another is running this will end immediately
        }, 400) // 500 ms latency
      } else {
        this.algoliaQuery(newQuery)
      }
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

    this.hourlyFilters = normalizedHourly

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onSkillsFilterChange(skillInput: string[]) {
    this.skillsFilter = skillInput

    this.currentPage = 0 // every time changes a parameter that isn't the page we have to reset page position

    // keep in sync also address bar, without refreshing page
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
    if (this.portfolioSub) {
      this.portfolioSub.unsubscribe()
    }
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

  filterArray(array: User[]) {
    const result = []
    for (let i = 0; i < array.length; i++) {
      const hourlyRate = parseInt(array[i].hourlyRate, 10)
      if (hourlyRate >= this.minValue && hourlyRate <= this.maxValue) {
        result.push(array[i])
      }
    }
    return result
  }

  setSmallCards(bool: boolean) {
    this.smallCards = bool
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

  getRandomGradient(colors: any): string {
    if (!(colors instanceof Array)) {
      colors = ['#00FFCC', '#33ccff', '#15EDD8']
    }
    const tmp: any = [
      `linear-gradient(122deg, ${colors[0]} 0%, ${colors[1]} 93%)`,
      `linear-gradient(110deg, ${colors[0]} 60%, ${colors[1]} 60%)`,
      `linear-gradient(70deg, ${colors[0]} 40%, ${colors[1]} 40%)`,
      `linear-gradient(110deg, ${colors[0]} 40%, rgba(0, 0, 0, 0) 30%), radial-gradient(farthest-corner at 0% 0%, ${colors[1]} 70%, ${colors[2]} 70%)`,
      `linear-gradient(70deg, ${colors[0]} 30%, rgba(0,0,0,0) 30%), linear-gradient(30deg, ${colors[1]} 60%, ${colors[2]} 60%)`,
    ]
    return tmp[Math.floor(Math.random() * (tmp.length - 1))]
  }

  toggleOverlay(documentID, otherDocumentID) {
    if (!this.containsClass(otherDocumentID, 'hide-menu')) {
      this.resetMenus()
      this.toggleClass(documentID, 'hide-menu')
    } else {
      this.toggleMenuOverlay()
      this.toggleClass(documentID, 'hide-menu')
      this.toggleClass('cancel-btn', 'hide-menu')
    }
    if (this.containsClass('menu-overlay', 'activate-menu') === false) {
      this.toggleClass('cancel-btn', 'hide-menu')
    }
  }

  resetMenus() {
    if (this.containsClass('hours-menu', 'hide-menu') === false) {
      this.toggleClass('hours-menu', 'hide-menu')
    }
    if (this.containsClass('category-menu', 'hide-menu') === false) {
      this.toggleClass('category-menu', 'hide-menu')
    }
  }

  closeAllMenus() {
    this.resetMenus()
    this.toggleMenuOverlay()
    this.toggleClass('cancel-btn', 'hide-menu')
  }

  containsClass(DocumentID, hiddenClassName) {
    return document
      .getElementById(DocumentID)
      .classList.contains(hiddenClassName)
  }

  toggleClass(DocumentID, hiddenClassName) {
    document.getElementById(DocumentID).classList.toggle(hiddenClassName)
  }

  toggleMenuOverlay() {
    document.getElementById('menu-overlay').classList.toggle('activate-menu')
  }

  toggleClearFilters() {
    if (this.containsClass('hours-menu', 'hide-menu') === false) {
      this.resetMenus()
      this.toggleMenuOverlay()
    }
    if (this.containsClass('category-menu', 'hide-menu') === false) {
      this.resetMenus()
      this.toggleMenuOverlay()
    }
    //this.onResetCategories()
    //this.onSetCategories()
    this.onResetHourlyRate()
    this.onSetHourlyRate()
  }
  /*
  onChooseCategory(categoryName) {
    const isInArray = this.categoryFilters.find(function (element) {
      return element === categoryName
    })
    if (typeof isInArray === 'undefined') {
      this.categoryFilters.push(categoryName)
    } else {
      const index = this.categoryFilters.findIndex(function (element) {
        return element === categoryName
      })
      this.categoryFilters.splice(index, 1)
    }
  }

  onSetCategories() {
    this.categoryQuery = ''
    if (this.categoryFilters && this.categoryFilters.length > 0) {
      for (let i = 0; i < this.categoryFilters.length; i++) {
        const category = encodeURIComponent(
          UserCategory[this.categoryFilters[i]]
        )
        const addToQuery = category === undefined || category === 'undefined'
        if (addToQuery === false) {
          this.categoryQuery =
            this.categoryQuery +
            'refinementList%5Bcategory%5D%5B' +
            i +
            '%5D=' +
            category +
            '&'
        }
      }
      this.toggleMenuOverlay()
      const query =
        '?' +
        '&' +
        this.categoryQuery +
        this.hourlyQuery +
        '&query=' +
        this.getInputQuery()
      this.router.navigateByUrl('/search' + query)
    } else {
      this.router.navigateByUrl(
        '/search?query=' + (this.getInputQuery() + '&' + this.hourlyQuery)
      )
    }
  }
*/
  onSetHourlyRate() {
    if (!this.containsClass('hours-menu', 'hide-menu')) {
      this.toggleMenuOverlay()
      this.hourlyQuery =
        'range%5BhourlyRate%5D=' + this.minValue + '%3A' + this.maxValue
      this.router.navigateByUrl(
        '/search?query=' +
          this.getInputQuery() +
          '&' +
          this.categoryQuery +
          this.hourlyQuery
      )
    }
  }

  getInputQuery() {
    const value = (
      document.getElementsByClassName(
        'ais-SearchBox-input'
      )[0] as HTMLInputElement
    ).value
    return value
  }
  /*
  onResetCategories() {
    if (this.categoryFilters.length > 0) {
      this.categoryFilters = []
      const categoryBtns = document.getElementsByClassName('category-btn')
      for (let i = 0; i < categoryBtns.length; i++) {
        if (categoryBtns[i].classList.contains('chosen')) {
          categoryBtns[i].classList.remove('chosen')
        }
      }
    }
  }
*/
  onResetHourlyRate() {
    this.maxValue = 300
    this.minValue = 0
  }
}
