import { Component, Input } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'profile-card',
  templateUrl: './profile-card.component.html',
})
export class ProfileCardComponent {
  @Input() isGrid: boolean = true

  @Input() index!: number
  @Input() avatarUri!: string
  @Input() name!: string
  @Input() title!: string
  @Input() isVerified!: boolean
  @Input() rating!: any
  @Input() skillTags!: string[]
  @Input() slug!: string
  @Input() address!: string
  @Input() timezone!: string
  @Input() hourlyRate!: number
  @Input() isSmall!: boolean

  constructor(private router: Router) {}

  get cssClasses(): string {
    let style = ''

    if (this.index % 3 === 0) style = 'bg-C500'
    else if (this.index % 3 === 1) style = 'bg-start-g1'
    else style = 'bg-lightGreen'

    return style
  }

  submitSearchQuery(value: string) {
    if (value)
      this.router.navigate(['search'], {
        queryParams: { query: value },
      })
  }
}
