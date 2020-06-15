import { Component, OnDestroy, OnInit } from '@angular/core'

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  //styleUrls: ['./dashboard.component.css'],
})

export class DashboardComponent implements OnInit, OnDestroy {
  pageLoaded = false

  constructor(
  ) {

  }

  async ngOnInit() {
    setTimeout(()=>{
      this.pageLoaded = true // TODO remove, testing only
    }, 1000)
  }

  ngOnDestroy() {

  }  
  
}
