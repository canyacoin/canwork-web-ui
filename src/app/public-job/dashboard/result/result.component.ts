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
  @Input() searchitems: string[] 
  @Output() onRemoveItem = new EventEmitter<string>()
  sortingMethods: SoringMethod[] | undefined

  selectedSorting: SoringMethod | undefined

  descriptions: string = `Hello, looking for someone precise that can check a diecut on correctness,
  since it has been most likely wrongly sized as seen in the attached image.
  The diecut that we think is wrong and needs to be adjusted is the mailerbox
  on the right side of the image. The left one is the sleeve that will go over
  the mailerbox and sizing is correct in size.I need small re-adjustments The
  left one is the sleeve that will go over the mailerbox and sizing is correct
  in size.I need small re-adjustments The left one is the sleeve that will go
  over the mailerbox and sizing is correct in size.I need small re-adjustments
  The left one is the sleeve that will go over the mailerbox and sizing is
  correct in size.I need small re-adjustments`

  skills:string[] =['Figma', 'UI/UX', 'website', 'web Development', 'No code', 'Shopify', 'hourly', 'expert', 'Figma', 'UI/UX', 'website', 'web Development']
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

  removeItemSubmit(item: string) {
    this.onRemoveItem.emit(item)
  }
}
