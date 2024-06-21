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
  @Input() bids = []
  @Input() currentUser!: User

  @Output() leftBtnEvent = new EventEmitter<Event>()
  @Output() rightBtnEvent = new EventEmitter<Event>()

  // core-functions
  formatDateFromString = formatDateFromString

  jobPoster: User = null
  isMyJob: boolean = false

  leftClick(event: Event) {
    this.leftBtnEvent.emit(event)
  }
  rightClick(event: Event) {
    this.rightBtnEvent.emit(event)
  }

  constructor(private userService: UserService) {}

  async ngOnInit() {
    console.log('starting ngONInit')
    if (this.job) {
      this.isMyJob = this.job.clientId === this.currentUser.address
      console.log('this.job.clientId', this.job.clientId)
      await this.setClient(this.job.clientId)
    }
  }

  async setClient(clientId: string) {
    /*
    new one, retrieve user only once (if not already retrieved)
    and use the new fastest Algolia getUserById service version
    */
    console.log('this.jobPoster', this.jobPoster)

    if (!this.jobPoster) {
      this.jobPoster = await this.userService.getUser(clientId)
      console.log('this.jobPoster', this.jobPoster)

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

  get isOpen() {
    return this.job.state === JobState.acceptingOffers
  }

  get isClosed() {
    return this.job.state === JobState.closed
  }

  get JobStateBackground() {
    // Need more cases
    let style = 'w-[16px] h-[16px] rounded-full '
    switch (this.job.state) {
      case JobState.acceptingOffers:
        style += 'bg-vibrantGreen'
        break
      case JobState.closed:
        style += 'bg-G500'
        break
      case JobState.termsAcceptedAwaitingEscrow:
        style += 'bg-start-g1'
        break
    }
    return style
  }

  getCategoryName(providerType: string) {
    const category = providerTypeArray.find((c) => c.id === providerType)
    return category.title
  }
}
