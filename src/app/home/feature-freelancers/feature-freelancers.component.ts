import {
  ChangeDetectorRef,
  Component,
  ChangeDetectionStrategy,
} from '@angular/core'
import { FeatureFreelancersService } from 'app/shared/constants/home-page'
import { WindowService } from 'app/shared/services/window.service'

import algoliasearch from 'algoliasearch/lite'
import { environment } from '@env/environment'

// slider
@Component({
  selector: 'home-feature-freelancers',
  templateUrl: './feature-freelancers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFreelancersComponent {
  featureSection = FeatureFreelancersService
  private windowWidth: number

  private algoliaSearch
  private algoliaIndex

  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey
  tempProviderArray = []
  skeletonProviderArray = [{}, {}, {}, {}]

  // carousel
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 3,
      numScroll: 3,
    },
    {
      breakpoint: '1128px',
      numVisible: 2,
      numScroll: 2,
    },
    {
      breakpoint: '768px',
      numVisible: 1,
      numScroll: 1,
    },
  ]

  constructor(
    private windowService: WindowService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

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
        //console.log(result)
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
        newArray.sort((a, b) => b.ratingCount - a.ratingCount)
        this.tempProviderArray = newArray
        this.cdr.detectChanges()
      })
      .catch((err) => {
        console.log(err)
      })
    //console.log(this.tempProviderArray)
  }
}
