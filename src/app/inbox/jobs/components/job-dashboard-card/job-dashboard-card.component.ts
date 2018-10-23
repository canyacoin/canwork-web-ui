import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-job-dashboard-card',
  templateUrl: './job-dashboard-card.component.html',
  styleUrls: ['./job-dashboard-card.component.css']
})
export class JobDashboardCardComponent implements OnInit {
  @Input() job: any;
  @Input() currentUser: any;

  constructor() { }

  ngOnInit() {
    console.log(this.job);
  }

}
