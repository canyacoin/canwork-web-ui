import { Component, OnInit, Directive } from '@angular/core'
import { FilterPipe } from 'ngx-filter-pipe'

@Directive()
@Component({
  selector: 'app-job-container',
  templateUrl: './job-container.component.html',
  styleUrls: ['./job-container.component.css'],
})
export class JobContainerComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
