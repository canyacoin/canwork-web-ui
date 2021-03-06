import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { environment } from '@env/environment'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'

import { Rating, User, UserCategory } from '../core-classes/user'
import { NavService } from '../core-services/nav.service'

declare var require: any
const algoliasearch = require('algoliasearch')

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUser: User
  private algoliaSearch
  private algoliaIndex
  public developers = []
  public designers = []
  public contents = []
  private authSub
  public previouslySeen = []
  public isOnMobile
  loadingDone = false
  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey

  constructor(
    private router: Router,
    private nav: NavService,
    private auth: AuthService,
    private userService: UserService
  ) {}
  providerTypes = [
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
      name: 'Financial Experts',
      img: 'finance.svg',
      id: 'finance',
    },
    {
      name: 'Marketing & Seo',
      img: 'marketing.svg',
      id: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.svg',
      id: 'virtualAssistant',
    },
  ]

  ngOnInit() {
    const ua = window.navigator.userAgent
    this.isOnMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
      ua
    )
    this.nav.setHideSearchBar(true)
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
        if (this.currentUser && this.currentUser.address) {
          this.setUpRecentlyViewed()
        }
      }
    })
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)
    this.getProviders(UserCategory.softwareDev, this.developers)
    this.getProviders(UserCategory.designer, this.designers)
    this.getProviders(UserCategory.contentCreator, this.contents)
  }

  async setUpRecentlyViewed() {
    this.userService.getViewedUsers(this.currentUser.address).then(result => {
      if (result && result.length > 0) {
        if (result.length > 3) {
          result = result.slice(0, 3)
        }
        this.previouslySeen = result
        for (let i = 0; i < this.previouslySeen.length; i++) {
          this.userService
            .getUser(this.previouslySeen[i].address)
            .then(user => {
              this.previouslySeen[i] = user
              if (i === this.previouslySeen.length - 1) {
                this.loadingDone = true
              }
            })
        }
      }
    })
  }

  getProviders(searchQuery, array) {
    this.algoliaIndex.search({ query: searchQuery }).then(res => {
      const result = res.hits
      for (let i = 1; i < 4; i++) {
        const provider = {
          address: result[i].address,
          avatar: result[i].avatar,
          skillTags: result[i].skillTags || [],
          title: result[i].title,
          name: result[i].name,
          category: result[i].category,
          timezone: result[i].timezone,
          hourlyRate: result[i].hourlyRate || 0,
          rating: result[i].rating || new Rating(),
          slug: result[i].slug,
          verified: result[i].verified,
        }
        array.push(provider)
      }
      return array
    })
  }

  onSubmit(value: any) {
    this.router.navigate(['search'], { queryParams: { query: value } })
  }
}
