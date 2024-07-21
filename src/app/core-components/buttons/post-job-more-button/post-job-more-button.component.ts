import { Component, Output, EventEmitter } from '@angular/core'

interface ItemType {
  name: string
  code: number
}

@Component({
  selector: 'post-job-more-button',
  templateUrl: './post-job-more-button.component.html',
})
export class PostJobMoreButtonComponent {
  @Output() btnClick = new EventEmitter<number>()

  actionLinks: ItemType[] | undefined
  selectedActionLink: ItemType | undefined

  ngOnInit() {
    this.actionLinks = [
      { name: 'See Preview', code: 1 },
      { name: 'Save As Draft', code: 0 },
    ]

    this.selectedActionLink = this.actionLinks[0]
  }

  itemClick(event: Event) {
    event.preventDefault()
    this.btnClick.emit(this.selectedActionLink.code)
  }
}
