import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

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
  @Input() totalRecords: number = 0
  @Input() rows: number = 9
  @Input() first: number = 0
  @Output() pageChange = new EventEmitter<number>() // two way binding to parent

  /*
  https://www.primefaces.org/primeng-v14-lts/paginator
  */
  skCards = new Array(12)
  isGrid: boolean = true

  onPageChange(e: PageEvent) {
    this.first = e.first

    this.pageChange.emit(e.page) // notify parent and algolia handler
  }

  handleGridChange(isGridView: boolean) {
    this.isGrid = isGridView
  }

  ngOnInit() {}
}
