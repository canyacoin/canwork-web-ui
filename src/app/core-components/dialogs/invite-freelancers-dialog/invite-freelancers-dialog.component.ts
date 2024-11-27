import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { Router } from '@angular/router'
import { Job } from '@class/job'
import { User } from '@class/user'
import { environment } from '@env/environment'
import { AuthService } from '@service/auth.service'
import { ChatService } from '@service/chat.service'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import algoliasearch, { SearchClient, SearchIndex } from 'algoliasearch'
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-invite-freelancers-dialog',
  templateUrl: './invite-freelancers-dialog.component.html',
  styleUrls: ['./invite-freelancers-dialog.component.css'],
})
export class InviteFreelancersDialogComponent {
  private displayDialog: boolean = false
  private algoliaSearch: SearchClient
  private algoliaIndex: SearchIndex
  @Input() currentUser: User
  @Input() userModel: User
  @Input() job: Job
  @Output() visibleChange = new EventEmitter<boolean>()
  freelancers = []
  algoIndex = environment.algolia.indexName
  algoId = environment.algolia.appId
  algoKey = environment.algolia.apiKey
  searchQuery = ''
  selectedSortBy = null
  selectedFilterBy = null

  sortByList = [
    { name: 'Top Rated', code: 'Top Rated' },
    { name: 'Top Earner', code: 'Top Earner' },
  ]

  filterByList = [
    { name: 'All', code: ' ' },
    { name: 'Design & Creative', code: 'Design & Creative' },
    { name: 'Software Developer', code: 'Software Developer' },
    { name: 'Content Creation', code: 'Content Creation' },
    { name: 'Virtual Assistant', code: 'Virtual Assistant' },
    { name: 'Financial Expert', code: 'Financial Expert' },
    { name: 'Marketing & SEO', code: 'Marketing & SEO' },
  ]

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
    private publicJobService: PublicJobService
  ) {}

  @Input()
  get visible() {
    return this.displayDialog
  }

  set visible(value) {
    this.displayDialog = value
    this.visibleChange.emit(this.displayDialog)
  }

  ngOnInit() {
    this.algoliaSearch = algoliasearch(this.algoId, this.algoKey)
    this.algoliaIndex = this.algoliaSearch.initIndex(this.algoIndex)
    this.getProviders()
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user
    })
  }

  onSearch() {
    this.getProviders()
  }

  sortbyFilter(sortBy) {
    this.selectedSortBy = sortBy
    this.getProviders()
  }

  filterByCategory(category) {
    this.selectedFilterBy = category
    this.getProviders()
  }

  showDialog() {
    this.displayDialog = true
  }

  async getProviders() {
    try {
      let query = this.searchQuery      
      if (this.selectedFilterBy) query += ` ${this.selectedFilterBy}`

      const res = await this.algoliaIndex.search<User>(query)
      const providers = res.hits || []

      if (this.selectedSortBy === 'Top Rated') {
        this.freelancers = providers.sort((a, b) => b.rating?.average - a.rating?.average)
      } else if (this.selectedSortBy === 'Top Earner') {
        this.freelancers = providers.sort((a, b) => +b.hourlyRate - +a.hourlyRate)
      } else {
        this.freelancers = providers
      }

      this.freelancers = this.freelancers.map((provider, index) => ({
        id: index,
        address: provider.address,
        avatarUri:
          provider.compressedAvatarUrl && provider.compressedAvatarUrl !== 'new'
            ? provider.compressedAvatarUrl
            : provider.avatar.uri,
        skillTags: provider.skillTags,
        title: provider.title,
        name: provider.name,
        description: provider.description,
        category: provider.category,
        timezone: provider.timezone,
        hourlyRate: provider.hourlyRate,
        ratingAverage: provider.rating?.average || 0,
        ratingCount: provider.rating?.count || 0,
        slug: provider.slug,
        verified: provider.verified,
        loading: false,
      }))
      this.cdr.detectChanges()
    } catch (error) {
      console.error('Error fetching providers:', error)
    }
  }

  chatUser(receiverAddress: string) {
    this.authService.currentUser$.pipe(take(1)).subscribe(async (user: User) => {
      if (user) {
        const receiver = await this.userService.getUser(receiverAddress)
        this.chatService.createNewChannel(this.currentUser, receiver)
      } else {
        this.router.navigate(['auth/login'], {
          queryParams: { returnUrl: this.router.url, nextAction: 'chat' },
        })
      }
    })
  }

  async inviteProvider(freelancer) {
    freelancer.loading = true
    const invited = await this.publicJobService.inviteProvider(this.job, this.currentUser, freelancer)
    freelancer.loading = false
    if (invited) return true
    alert('something went wrong')
    return false
  }

  async cancelInvite(freelancer) {
    freelancer.loading = true
    const invited = await this.publicJobService.cancelInvite(this.job, this.currentUser, freelancer)
    freelancer.loading = false
    if (invited) return true
    alert('something went wrong')
    return false
  }
}
