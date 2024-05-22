import { Component, Input } from '@angular/core'

@Component({
  selector: 'job-card',
  templateUrl: './job-card.component.html',
})
export class JobCardComponent {
  @Input() id!: string
  @Input() clientId!: string
  @Input() providerId!: string
  @Input() description!: string
  @Input() paymentType!: string
  @Input() budget!: number
  @Input() deadline!: string
  @Input() slug!: string
  @Input() skills!: string[]
  @Input() title!: string
  @Input() createAt!: number
  @Input() Location!: string
  @Input() proposals!: number
  @Input() projectType: string // 1. contentCreator 2. softwareDev 3. designer , 4. marketing 5. virtualAssistant ...

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

  getImage(id: string) {
    let url = '/assets/massimo/images/'
    const type = this.providerTypes.find((prov) => prov.id === id)
    url = url + type.img
    return url
  }

  timeAgo(createdAt: number): string {
    const now = Date.now()
    const diff = now - createdAt

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const months = Math.floor(days / 30)

    if (seconds < 60) {
      return `Posted ${seconds} s ago`
    } else if (minutes < 60) {
      return `Posted ${minutes} mins ago`
    } else if (hours < 24) {
      return `Posted ${hours} hrs ago`
    } else if (days < 30) {
      return `Posted ${days} days ago`
    } else {
      return `Posted ${months} months ago`
    }
  }
  formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'long' })
    const year = date.getFullYear()

    const daySuffix = this.getDaySuffix(day)

    return `${day}${daySuffix} ${month} ${year}`
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

// id: string
// clientId: string
// providerId: string
// information: JobDescription
// paymentType: PaymentType
// budget: number
// paymentLog: Array<Payment> = []
// bscEscrow: boolean = false
// state: JobState
// actionLog: Array<IJobAction> = []
// boostVisibility = false
// reviewId: string
// deadline: string
// visibility: string
// draft: boolean
// slug: string
// createAt: number
// updateAt: number
// invites: string[] = []
