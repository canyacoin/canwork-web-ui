import { Component } from '@angular/core'

@Component({
  selector: 'app-faqs-page',
  templateUrl: './faqs.component.html',
})
export class FaqsComponent {
  faqs = []
  queryFaqs: any = []

  handleSearchQuery(query: string) {
    if (query) {
      console.log('query is ===', query)
      // const tmpFaq: any = []
      // this.faqs.map((item) => {
      //   if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
      //     tmpFaq.push(item)
      //   }
      // })
      // this.queryFaqs = tmpFaq
    }
  }
}
