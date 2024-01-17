import { Component, Input } from '@angular/core'
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
  queryFaqs = []

  first: number = 0
  rows: number = 10

  @Input()
  set query(value: string) {
    this.queryString = value
    this.performSearch(value)
  }

  onPageChange(event: PageEvent) {
    this.first = event.first
    this.rows = event.rows
  }

  performSearch(query: string) {
    // const tmpFaq: any = []
    // this.resultSection.map((section) => {
    //   section.items.map((item) => {
    //     if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
    //       tmpFaq.push(item)
    //     }
    //   })
    // })
    // this.queryFaqs = tmpFaq
  }
}
