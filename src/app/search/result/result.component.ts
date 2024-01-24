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

  skCards = new Array(12)
  isGrid: boolean = true

  first: number = 0
  rows: number = 10

  onPageChange(event: PageEvent) {
    this.first = event.first
    this.rows = event.rows
  }

  handleGridChange(isGridView: boolean) {
    this.isGrid = isGridView
  }

  ngOnInit() {}
}
