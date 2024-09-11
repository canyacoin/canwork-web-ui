import { Component, Input, Output, EventEmitter } from '@angular/core'
import { ResultService } from 'app/shared/constants/faqs-page'

interface PageEvent {
  first: number
  rows: number
  page: number
  pageCount: number
}
@Component({
  selector: 'blog-result',
  templateUrl: './result.component.html',
})
export class ResultComponent {
  resultSection = ResultService
  queryString: string = ''
  @Input() hits: any[] = []
  @Input() totalRecords: number = 0
  @Input() rows: number = 9
  @Input() first: number = 0
  @Output() pageChange = new EventEmitter<number>() // two way binding to parent

  onPageChange(e: PageEvent) {
    // this.first = e.first
    this.pageChange.emit(e.page) // notify parent and algolia handler
  }
}
