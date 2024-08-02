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
  styleUrls: ['./result.component.css'],
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  @Input() isLoading: boolean = true
  @Input() stats: any
  @Input() searchItems: string[] = []
  @Input() searchParam: string
  @Input() jobs: any[]
  @Input() first: number = 0
  @Input() totalRecords: number = 0
  @Input() rows: number = 5
  @Output() pageChange = new EventEmitter<number>() // two way binding to parent
  @Output() onRemoveItem = new EventEmitter<string>()
  @Output() sortby = new EventEmitter<SoringMethod>()
  @Output() filterVisibleChange = new EventEmitter<Event>()
  sortingMethods: SoringMethod[] | undefined

  selectedSorting: SoringMethod | undefined

  /*
  https://www.primefaces.org/primeng-v14-lts/paginator
  */

  skCards = new Array(5)
  onPageChange(e: PageEvent) {
    this.first = e.first
    this.rows = e.rows // this is injected from parent
    this.pageChange.emit(e.page) // notify parent and algolia handler
  }

  ngOnInit() {
    this.sortingMethods = [
      { name: 'Newest', code: 'newest' },
      // { name: 'Relevance', code: 'relevance' },
      { name: 'Budget Up', code: 'budgetup' },
      { name: 'Budget Down', code: 'budgetdown' },
    ]
    this.selectedSorting = this.sortingMethods[0]
  }

  removeItemSubmit(item: string) {
    this.onRemoveItem.emit(item)
  }

  sortbyFilter(item: SoringMethod) {
    this.sortby.emit(item)
  }

  onFilterClick(event: Event) {
    event.preventDefault()
    this.filterVisibleChange.emit(event)
  }
}
