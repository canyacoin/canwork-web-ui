import {
  Component,
  Input,
  OnInit,
  Directive,
  Output,
  EventEmitter,
} from '@angular/core'
import { PublicJobService } from '@service/public-job.service'
import { UserService } from '@service/user.service'
import { providerTypeArray } from 'app/shared/constants/providerTypes'

import { Router } from '@angular/router'

import * as moment from 'moment'
import { Job, JobState } from '@class/job'

@Component({
  selector: 'job-dashboard-card',
  templateUrl: './job-dashboard-card.component.html',
})
export class JobDashboardCardComponent implements OnInit {
  @Input() job: Job
  @Input() jobType: string
  @Output() jobCancelled = new EventEmitter<Event>()
  visibleDeleteModal: boolean = false

  location: string = '...'
  proposals: number = 0

  favourite: boolean = false

  constructor(
    private router: Router,
    private publicJobsService: PublicJobService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    let jobPoster = await this.userService.getUser(this.job.clientId)
    this.location = jobPoster.timezone

    this.publicJobsService.getPublicJobBids(this.job.id).subscribe((result) => {
      let bids = result || []
      this.proposals = bids.length
    })
  }

  getProviderImage(id: string) {
    const category = providerTypeArray.find((prov) => prov.id === id)
    return category.iconSrc
  }

  async cancelJob(event: Event) {
    event.stopPropagation()
    this.visibleDeleteModal = false
    if (this.job.clientId) {
      this.jobCancelled.emit(event)
      const updated = await this.publicJobsService.cancelJob(this.job.id)
      console.log('update:', updated)
      if (updated) {
        this.job.state = JobState.closed
      }
    }
  }

  updateDialog(event: Event) {
    event.stopPropagation()
    this.visibleDeleteModal = !this.visibleDeleteModal
  }
  stripHtmlTags(html: string): string {
    // Create a new DOM element to use the browser's parsing capabilities
    const div = document.createElement('div')

    // Assign the HTML string to the innerHTML of the created element
    div.innerHTML = html

    // Use the textContent property to get the plain text without HTML tags
    return div.textContent || div.innerText || ''
  }

  timeAgo(createdAt: number): string {
    return moment(createdAt).fromNow()
  }
  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()

    const daySuffix = this.getDaySuffix(day)

    return `${day}${daySuffix} ${month} ${year}`
  }

  moveToJobDetails() {
    if (this.jobType === 'active')
      this.router.navigate(['/inbox/job/', this.job.id])
    else if (this.jobType === 'public' || this.jobType === 'submitted')
      this.router.navigate(['/jobs/public/', this.job.slug])
    else if (this.jobType === 'direct')
      this.router.navigate(['/jobs/', this.job.id])
  }
  makefavorite(event: Event) {
    event.stopPropagation()
    this.favourite = !this.favourite
  }

  getDaySuffix(day: number): string {
    if (day > 3 && day < 21) return 'th' // All days between 4 and 20 end with 'th'
    switch (day % 10) {
      case 1:
        return 'st'
      case 2:
        return 'nd'
      case 3:
        return 'rd'
      default:
        return 'th'
    }
  }
}
