import { Http } from '@angular/http'
import { Result, Stats, Job } from './../../../functions/src/bepescrow-monitor'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-dao-dash',
  templateUrl: './dao-dash.component.html',
  styleUrls: ['./dao-dash.component.css'],
})
export class DAODashComponent implements OnInit {
  escrowResult: Result
  escrowStats: Stats
  jobs: Job[]

  loading = true
  displayTotals = false

  constructor(http: Http) {
    const BEPESCROW_API_URL = 'https://bepescrow.herokuapp.com/jobs' //still looking for a better way to handle escrow api url
    http.get(BEPESCROW_API_URL).subscribe(response => {
      this.escrowResult = response.json()
      this.escrowStats = this.escrowResult.stats
      this.loading = false
    })
  }

  ngOnInit() {}

  displayTotal() {
    this.jobs = this.escrowResult.jobs
    this.displayTotals = !this.displayTotals
  }
}
