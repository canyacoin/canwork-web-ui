import { Component, Input } from '@angular/core'
import { ResultService } from 'app/shared/constants/faqs-page'

@Component({
  selector: 'blog-result',
  templateUrl: './result.component.html',
})
export class ResultComponent {
  resultSection = ResultService
  queryString: string = ''
  queryFaqs = []

  @Input()
  set query(value: string) {
    this.queryString = value
    this.performSearch(value)
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
