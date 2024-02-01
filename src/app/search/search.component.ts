import { Component, OnDestroy, OnInit } from '@angular/core'
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

@Component({
  selector: 'app-search-page',
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit, OnDestroy {
  allProviders: User[] = []
  filteredProviders: User[] = []
  chosenFilters = []
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
  currentQueryString: string = '' // the current search on query parameters combination
  noSearchParams = false // there are no search params, we have to render this notice
  // todo inject into results component

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
  currentUser: any
  private algoliaSearch // new
  private algoliaSearchClient // new

  constructor(
    private activatedRoute: ActivatedRoute,
    private navService: NavService,
    private auth: AuthService,
    private router: Router,
    private location: Location
  ) {
    this.routeSub = this.activatedRoute.queryParams.subscribe((params) => {
      this.searchInput = params['query'] || ''
      this.providerFilters = JSON.parse(params['providers'] || '[]')
      // this is the full stringified algolia query
      /*if (this.query === '') {
        this.query = params['query']
      }*/

      //if (this.categoryFilters.length < 1 && params['category'] !== '') {
      //  this.categoryFilters.push(params['category'])
      //}

      if (!this.loading) {
        //this.rendering = true
        //setTimeout(() => {
        //  this.rendering = false
        //})
        if (this.containsClass('menu-overlay', 'activate-menu')) {
          this.toggleMenuOverlay() // obsolete?
        }
      }
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

    /*this.algoliaSearchConfig = {
      indexName: this.algoliaIndex,
      searchClient,
      
      // needed only for instant search, not needed anymore
      
      routing: {
        stateMapping: {
          routeToState(routeState: any) {
            const generatedQuery = {}
            generatedQuery[self.algoliaIndex] = {}

            // free text query
            if (routeState.query)
              generatedQuery[self.algoliaIndex].query = routeState.query

            // category list
            if (routeState.refinementList)
              generatedQuery[self.algoliaIndex].refinementList =
                routeState.refinementList

            // rate range
            if (routeState.range)
              generatedQuery[self.algoliaIndex].range = routeState.range

            //console.log(generatedQuery)
            return generatedQuery
          },
        },
      },
    }*/
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
    // todo, get current query from url
    let currentPath = this.location.path()
    let splittedPath = currentPath.split('?')
    let currentQuery = splittedPath[splittedPath.length - 1]
    //console.log("currentQuery: "+currentQuery);

    this.algoliaQuery(currentQuery)
  }

  algoliaQuery(newQuery) {
    if (!this.searchInput && this.providerFilters.length == 0) {
      this.loading = false
      this.noSearchParams = true
      return
    }
    this.noSearchParams = false
    if (this.loading) return // avoid overlapping searches
    this.loading = true
    let newArray = []
    let algoliaSearchObject = <any>{}
    /* 
      https://www.algolia.com/doc/api-reference/search-api-parameters/
      hitsPerPage and so on
    */
    if (this.providerFilters.length > 0) {
      // https://www.algolia.com/doc/api-reference/api-parameters/facetFilters/
      algoliaSearchObject.facetFilters = [[]]
      this.providerFilters.forEach((providerName) => {
        algoliaSearchObject.facetFilters[0].push(`category:${providerName}`)
      }) // OR
    }

    this.algoliaSearchClient
      .search(this.searchInput, algoliaSearchObject)
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
              timezone: result[i].timezone,
              hourlyRate: result[i].hourlyRate || 0,
              ratingAverage: result[i].rating?.average | 0,
              ratingCount: result[i].rating?.count | 0,
              slug: result[i].slug,
              verified: result[i].verified,
            }
            newArray.push(provider)
          }
        }
        // newArray.sort((a, b) => b.ratingCount - a.ratingCount)
        this.hits = newArray // update
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
    let newQueryString = `query=${this.searchInput}&providers=${JSON.stringify(
      this.providerFilters
    )}`
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
      setTimeout(() => {
        this.algoliaQuery(newQuery) // not first invocation
        // if another is running this will end immediately
      }, 400) // 500 ms latency
    } else {
      console.log('up to date') // debug, check this well better later when we add other search facets
    }
  }

  // two way binding, event from child (user input)
  onSearchInputChange(searchInput: string) {
    this.searchInput = searchInput
    // keep in sync also address bar, without refreshing page
    const newQueryString = this.syncAddressBar()

    this.refreshResultsIfNeeded(newQueryString)
  }

  // two way binding, event from child (user input)
  onProviderFiltersChange(providerTypes: any) {
    let sortedProviders = providerTypes
    sortedProviders = providerTypes.sort() // sort to have a predictable string
    this.providerFilters = sortedProviders

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
