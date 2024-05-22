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

  @Input() isLoading: boolean = true
  @Input() stats: any
  @Input() searchitems: string[] 
  @Input() searchParam: string
  @Input() jobs: any[]
  @Input() first: number = 0
  @Input() totalRecords: number = 0
  @Input() rows: number = 5
  @Output() pageChange = new EventEmitter<number>() // two way binding to parent
  @Output() onRemoveItem = new EventEmitter<string>()
  sortingMethods: SoringMethod[] | undefined

  selectedSorting: SoringMethod | undefined


  /*
  https://www.primefaces.org/primeng-v14-lts/paginator
  */

  onPageChange(e: PageEvent) {
    console.log(e);
    
    this.first = e.first
    this.rows = e.rows // this is injected from parent
    this.pageChange.emit(e.page) // notify parent and algolia handler
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

  removeItemSubmit(item: string) {
    this.onRemoveItem.emit(item)
  }
}
