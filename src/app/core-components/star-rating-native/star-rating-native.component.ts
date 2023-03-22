import { Component, Input, OnInit, Directive } from '@angular/core'

@Directive()
@Component({
  selector: 'app-star-rating-native',
  templateUrl: './star-rating-native.component.html',
  styleUrls: ['./star-rating-native.component.css'],
})
export class StarRatingNativeComponent implements OnInit {
  @Input() stars: string
  @Input() count: string

  constructor() {}

  ngOnInit() {}
}
