import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Job } from '@class/job'
import { JobState } from '@class/job'
import { formatDateFromString } from 'app/core-functions/date'
import { providerTypeArray } from 'app/shared/constants/providerTypes'
import { UserService } from '@service/user.service'
import { User } from '@class/user'
@Component({
  selector: 'job-status-panel',
  templateUrl: './job-status-panel.component.html',
})
export class JobStatusPanelComponent {
  @Input() job!: Job
  @Input() proposals: number = 0 // current job's bids.length
  @Input() currentUser!: User
  // from post job page
  @Input() isPostJobPage: boolean = false
  @Input() isPostButtonsShow: boolean = false
  @Input() userCanReview: boolean = false

  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()

  // core-functions
  formatDateFromString = formatDateFromString

  jobPoster: User = null
  isMyJob: boolean = false

  leftClick(event: Event) {
    event.preventDefault()
    this.leftBtnEvent.emit(event)
  }
  rightClick(event: Event) {
    event.preventDefault()
    this.rightBtnEvent.emit(event)
  }

  constructor(private userService: UserService) {}

  async ngOnInit() {
    // console.log('starting ngONInit')
    // console.log('this.job', this.job)
    // console.log('this.currentUser', this.currentUser)
    // we don't need to call this function if isPostJobPage is true
    if (this.job && !this.isPostJobPage && this.currentUser?.address) {
      this.isMyJob = this.job.clientId === this.currentUser.address
      // console.log('this.job.clientId', this.job.clientId)
      await this.setClient(this.job.clientId)
    }
  }

  async setClient(clientId: string) {
    /*
    new one, retrieve user only once (if not already retrieved)
    and use the new fastest Algolia getUserById service version
    */
    // console.log('this.jobPoster', this.jobPoster)

    if (!this.jobPoster) {
      this.jobPoster = await this.userService.getUser(clientId)
      // console.log('this.jobPoster', this.jobPoster)

      if (this.jobPoster) {
        let avatar = this.jobPoster.avatar // current, retrocomp
        //console.log(result[i])
        if (
          this.jobPoster.compressedAvatarUrl &&
          this.jobPoster.compressedAvatarUrl != 'new'
        ) {
          // keep same object structure
          // use compress thumbed if exist and not a massive update (new)
          avatar = {
            uri: this.jobPoster.compressedAvatarUrl,
          }
        }
        this.jobPoster.avatarUri = avatar.uri
      }
    }
  }

  get isAcceptingOffers(): boolean {
    return this.job.state === JobState.acceptingOffers
  }

  get isAwaitingEscrow(): boolean {
    return this.job.state === JobState.termsAcceptedAwaitingEscrow
  }

  get isInEscrow(): boolean {
    return this.job.state === JobState.inEscrow
  }

  get isMarkedAsComplete(): boolean {
    return this.job.state === JobState.workPendingCompletion
  }

  get isJobComplete(): boolean {
    return this.job.state === JobState.complete
  }

  get isClosed() {
    return this.job.state === JobState.closed
  }

  getCategoryName(providerType: string) {
    const category = providerTypeArray.find((c) => c.id === providerType)
    return category.title
  }
}
