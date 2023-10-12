import { providerTypeArray } from './../const/providerTypes'
import { Component, OnInit, Directive } from '@angular/core'
import { Router } from '@angular/router'
import { environment } from '@env/environment'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'

import { Rating, User, UserCategory } from '../core-classes/user'
import { NavService } from '../core-services/nav.service'

declare var require: any
import algoliasearch from 'algoliasearch/lite'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUser: User
  private algoliaSearch
  private algoliaIndex
  public providerTypes = providerTypeArray
  public selectedProvType = providerTypeArray[0].id
  public tempProviderArray = []
  private authSub

  public isOnMobile
  loadingDone = false
  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey

  // COMMENTED OUT AS HOME PAGE DOESNT NEED PRE-CALLED FREELANCERS ANYMORE
  // public developers = []
  // public designers = []
  // public contents = []

  // COMMENTED OUT AS HOME PAGE DOESNT USE RECENTLY VIEWED ANYMORE
  // public previouslySeen = []

  constructor(
    private router: Router,
    private nav: NavService,
    private auth: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    const ua = window.navigator.userAgent
    this.isOnMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(
        ua
      )
    this.nav.setHideSearchBar(true)
    this.authSub = this.auth.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user
        // COMMENTED OUT AS HOME PAGE DOESNT USE RECENTLY VIEWED ANYMORE
        // if (this.currentUser && this.currentUser.address) {
        //   this.setUpRecentlyViewed()
        // }
      }
    })
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)

    // COMMENTED OUT AS HOME PAGE DOESNT NEED PRE-CALLED FREELANCERS ANYMORE
    // this.getProviders(UserCategory.softwareDev, this.developers)
    // this.getProviders(UserCategory.designer, this.designers)
    // this.getProviders(UserCategory.contentCreator, this.contents)

    this.getProviders(UserCategory[this.selectedProvType])
  }

  // COMMENTED OUT AS HOME PAGE DOESNT USE RECENTLY VIEWED ANYMORE
  // async setUpRecentlyViewed() {
  //   this.userService.getViewedUsers(this.currentUser.address).then(result => {
  //     if (result && result.length > 0) {
  //       if (result.length > 3) {
  //         result = result.slice(0, 3)
  //       }
  //       this.previouslySeen = result
  //       for (let i = 0; i < this.previouslySeen.length; i++) {
  //         this.userService
  //           .getUser(this.previouslySeen[i].address)
  //           .then(user => {
  //             this.previouslySeen[i] = user
  //             if (i === this.previouslySeen.length - 1) {
  //               this.loadingDone = true
  //             }
  //           })
  //       }
  //     }
  //   })
  // }

  getProviders(searchQuery) {
    let newArray = []
    this.algoliaIndex
      .search(searchQuery)
      .then((res) => {
        const result = res.hits
        for (let i = 0; i < result.length; i++) {
          // TODO: Add a dummy/placeholder if < 3 profiles found?
          if (result[i]) {
            let avatar = result[i].avatar // current, retrocomp
            console.log(result[i])
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
              address: result[i].address,
              avatar, // new
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
            newArray.push(provider)
          }
        }
        newArray.sort((a, b) => b.rating.count - a.rating.count)
      })
      .catch((err) => {
        console.log(err)
      })
    this.tempProviderArray = newArray
  }

  onSubmit(value: any) {
    this.router.navigate(['search'], { queryParams: { query: value } })
  }

  onSelectProvType(value: any) {
    this.selectedProvType = value
    this.getProviders(UserCategory[value])
  }
}
