import { Component, OnInit, Directive } from '@angular/core'

@Directive()
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
