import { ChangeDetectorRef, Component } from '@angular/core'
import { environment } from '@env/environment'
import algoliasearch from 'algoliasearch'

@Component({
  selector: 'app-invite-freelancers-dialog',
  templateUrl: './invite-freelancers-dialog.component.html',
  styleUrls: ['./invite-freelancers-dialog.component.css'],
})
export class InviteFreelancersDialogComponent {
  displayDialog: boolean = true
  private algoliaSearch
  private algoliaIndex
  freelancers = []

  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey
  sortByList = [
    { name: 'Top Rated', code: 'Top Rated' },
    { name: 'Top Earner', code: 'Top Earner' },
  ]

  filterByList = [
    { name: 'Design & Creative', code: 'Design & Creative' },
    { name: 'Software Developer', code: 'Software Developer' },
    { name: 'Content Creation', code: 'Content Creation' },
    { name: 'Virtual Assistant', code: 'Virtual Assistant' },
    { name: 'Financial Expert', code: 'Financial Expert' },
    { name: 'Marketing & SEO', code: 'Marketing & SEO' },
  ]
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)
    this.getProviders('')
  }

  selectedSortBy = null
  showDialog() {
    this.displayDialog = true
  }

  hideDialog() {
    this.displayDialog = false
  }

  async getProviders(searchQuery) {
    let newArray = []
    const res = await this.algoliaIndex.search(searchQuery)
    const result = res.hits
    console.log({ result })

    for (let i = 0; i < result.length; i++) {
      // TODO: Add a dummy/placeholder if < 3 profiles found?
      if (result[i]) {
        let avatar = result[i].avatar // current, retrocomp
        //console.log(result[i])
        if (result[i].compressedAvatarUrl && result[i].compressedAvatarUrl != 'new') {
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
          description: result[i].description,
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
    this.freelancers = newArray
    console.log({ newArray })

    this.cdr.detectChanges()
  }
}
