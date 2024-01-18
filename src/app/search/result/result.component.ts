import { Component, OnInit } from '@angular/core'

interface PageEvent {
  first: number
  rows: number
  page: number
  pageCount: number
}

@Component({
  selector: 'search-result',
  templateUrl: './result.component.html',
})
export class ResultComponent implements OnInit {
  numberOfFreelancers = 3532
  skCards = new Array(12)
  profileCards = new Array(0)
  isGrid: boolean = true
  isLoading: boolean = true

  first: number = 0
  rows: number = 10

  onPageChange(event: PageEvent) {
    this.first = event.first
    this.rows = event.rows
  }

  handleGridChange(isGridView: boolean) {
    this.isGrid = isGridView
  }

  ngOnInit() {
    setTimeout(() => {
      this.isLoading = false
    }, 5000)
  }
}
