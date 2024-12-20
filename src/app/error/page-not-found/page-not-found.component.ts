import { Component, OnInit, Directive } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'app-page-not-found-page',
  templateUrl: './page-not-found.component.html',
})
export class PageNotFoundComponent implements OnInit {
  page: number = 0

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.page !== undefined) this.page = params.page
      console.log('page:', this.page)
    })
  }
}
