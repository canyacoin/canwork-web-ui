import { Component, OnInit, Input } from '@angular/core'
import { ResultService } from 'app/shared/constants/faqs-page'

@Component({
  selector: 'faqs-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  @Input() query: string = ''

  resultSection = ResultService

  ngOnInit() {}
}
