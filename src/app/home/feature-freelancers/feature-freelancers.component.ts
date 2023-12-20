import { Component, AfterViewInit } from '@angular/core'
import { FeatureFreelancersService } from 'app/shared/constants/home'
import { WindowService } from 'app/shared/services/window.service'

import algoliasearch from 'algoliasearch/lite'
import { environment } from '@env/environment'

import * as $ from 'jquery'

// slider
@Component({
  selector: 'feature-freelancers',
  templateUrl: './feature-freelancers.component.html',
})
export class FeatureFreelancersComponent implements AfterViewInit {
  featureSection = FeatureFreelancersService
  private windowWidth: number

  private algoliaSearch
  private algoliaIndex

  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey
  tempProviderArray = []

  constructor(private windowService: WindowService) {}

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   $('.carousel').slick({
    //     slidesToShow: 2,
    //     dots: true,
    //     centerMode: true,
    //   })
    // }, 5000)
  }

  ngOnInit() {
    this.windowService.getWindowWidth().subscribe((width) => {
      this.windowWidth = width
    })

    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)

    // this.getProviders(UserCategory[this.selectedProvType])
    this.getProviders('SOFTWARE DEVELOPERS')
  }

  isWindowWidthMd(): boolean {
    return this.windowWidth > 768
  }

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
        newArray.sort((a, b) => b.rating.count - a.rating.count)
      })
      .catch((err) => {
        console.log(err)
      })
    this.tempProviderArray = newArray
    console.log(this.tempProviderArray)
  }
}
