import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'

interface PageEvent {
  first: number
  rows: number
  page: number
  pageCount: number
}

interface SoringMethod {
  name: string
  code: string
}

@Component({
  selector: 'dashboard-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  // @Input() profileCards: any[]
  @Input() isLoading: boolean = true
  // @Input() noSearchParams: boolean = true
  // @Input() totalRecords: number = 0
  // @Input() rows: number = 10
  // @Output() pageChange = new EventEmitter<number>() // two way binding to parent
  // @Input() first: number = 0
  @Input() stats: any

  sortingMethods: SoringMethod[] | undefined

  selectedSorting: SoringMethod | undefined

  /*
  https://www.primefaces.org/primeng-v14-lts/paginator
  */
  skCards = new Array(5)

  onPageChange(e: PageEvent) {
    // this.first = e.first
    // //this.rows = event.rows // this is injected from parent
    // this.pageChange.emit(e.page) // notify parent and algolia handler
  }
  ngOnInit() {
    this.sortingMethods = [
      { name: 'Newest', code: 'newest' },
      { name: 'Relevance', code: 'relevance' },
      { name: 'Budget Up', code: 'budgetup' },
      { name: 'Budget Down', code: 'budgetdown' },
    ]
    this.selectedSorting = this.sortingMethods[0]
  }
}
