import { Component, OnInit, Directive } from '@angular/core'
import { NotFoundService } from 'app/shared/services/not-found.service'

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css'],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private notFoundService: NotFoundService) {}

  ngOnInit() {
    this.notFoundService.setIsShowBoarder(false)
  }
}
