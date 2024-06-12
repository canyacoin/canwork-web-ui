import {
  Component,
  Input,
  OnInit,
  Directive,
  Output,
  EventEmitter,
} from '@angular/core'
import { PublicJobService } from '@service/public-job.service'

import { Router } from '@angular/router'

import * as moment from 'moment'

@Component({
  selector: 'app-job-dashboard-card',
  templateUrl: './job-dashboard-card.component.html',
})
export class JobDashboardCardComponent implements OnInit {
  @Input() job: any
  @Input() type: string
  @Input() isPublic: boolean
  @Input() jobType: string
  visible: boolean = false

  @Output() CancelJob = new EventEmitter<string>()
  constructor(
    private router: Router,
    private publicJobsService: PublicJobService
  ) {}

  favourite: boolean = false

  providerTypes = [
    {
      name: 'Content Creators',
      img: 'writer.png',
      id: 'contentCreator',
    },
    {
      name: 'Software Developers',
      img: 'dev.png',
      id: 'softwareDev',
    },
    {
      name: 'Designers & Creatives',
      img: 'creatives.png',
      id: 'designer',
    },
    {
      name: 'Marketing & SEO',
      img: 'marketing.png',
      id: 'marketing',
    },
    {
      name: 'Virtual Assistants',
      img: 'assistant.png',
      id: 'virtualAssistant',
    },
  ]

  ngOnInit() {}

  getImage(id: string) {
    let url = '/assets/massimo/images/'
    const type = this.providerTypes.find((prov) => prov.id === id)
    url = url + type.img
    return url
  }

  async cancelJob(event: Event) {
    event.stopPropagation()
    this.visible = !this.visible
    if (this.job.clientId) {
      const updated = await this.publicJobsService.cancelJob(this.job.id)
      if (updated) {
        this.job.state = 'Public job closed'
        this.CancelJob.emit(this.job.id)
      }
    }
  }

  updateDialog(event: Event) {
    event.stopPropagation()
    this.visible = !this.visible
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

  movetojobdetail() {
    this.router.navigate(['/jobs/public/', this.job.slug])
  }
  Makefavorite(event: Event) {
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
