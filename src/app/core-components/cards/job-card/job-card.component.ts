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
