import { Component } from '@angular/core'

@Component({
  selector: 'app-faqs-page',
  templateUrl: './faqs.component.html',
})
export class FaqsComponent {
  queryFaqs: string = '';

  handleSearchQuery(query: string) {
    if (query) {
      this.queryFaqs = query;
    }
  }
}
