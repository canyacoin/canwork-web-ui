import { Component, OnInit, Input } from '@angular/core'

interface PageEvent {
  first: number
  rows: number
  page: number
  pageCount: number
}

@Component({
  selector: 'search-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  @Input() profileCards: any[]
  @Input() isLoading: boolean = true
  @Input() noSearchParams: boolean = true

  skCards = new Array(12)
  isGrid: boolean = true

  first: number = 0
  rows: number = 3
  showresult = []

  onPageChange(event: PageEvent) {
    this.first = event.first
    this.rows = event.rows
    console.log('first', this.first)
    this.showresult = this.profileCards.slice(
      this.first,
      this.first + this.rows
    )
    console.log('this.showresult', this.showresult)
  }

  handleGridChange(isGridView: boolean) {
    this.isGrid = isGridView
  }

  ngOnInit() {}
}
