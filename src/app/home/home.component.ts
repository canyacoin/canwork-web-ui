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
    // TODO: Update the copy content for descriptions (the design didnt have unique content for this)
    {
      name: 'Content Creators',
      img: 'content-creators.svg',
      desc:
        'Hire professional freelance writers who are ready to create quality content for your business at an affordable price. Our freelancers are vetted and  have been creating high-quality content for customers both small and large for years.',
      id: 'contentCreator',
    },
    {
      name: 'Software Developers',
      img: 'software-developers.svg',
      desc:
        'Looking for experienced developers to work with you? CanWork features only the best of professional developers who have a passion for the craft. You will be able to work with various developers on including front end, back end and full stack development.',
      id: 'softwareDev',
    },
    {
      name: 'Designers & Creatives',
      img: 'designers-creatives.svg',
      desc:
        'Find the right freelance designer for your next project. Battle tested and combat ready designers with great years of experience. Our creative professionals have a great range of skillsets, including UI/UX design, graphic design, brand identity and product design.',
      id: 'designer',
    },
    {
      name: 'Financial Experts',
      img: 'financial-experts.svg',
      desc:
        'Wall Street’s best minds available here on CanWork to help you get your finances in order and make better decisions. Have greater access to capital and make more money by working with the best freelancers on CanWork.',
      id: 'financial',
    },
    {
      name: 'Marketing & Seo',
      img: 'marketing-seo.svg',
      desc:
        'As a content creator for hire, our professional team of writers is ready to create quality content for your business at an affordable price. We have been creating high-quality educational content for customers both small and large for years.',
      id: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      img: 'virtual-assistants.svg',
      desc:
        'As a content creator for hire, our professional team of writers is ready to create quality content for your business at an affordable price. We have been creating high-quality educational content for customers both small and large for years',
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
      var l
      if (result.length > 4) {
        l = 4
      } else {
        l = result.length
      }
      for (let i = 0; i < l; i++) {
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
