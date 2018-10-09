import { Component, Input, OnInit } from '@angular/core';
import { Review } from '@class/review';
import { User } from '@class/user';
import { UserService } from '@service/user.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() user: User

  reviews: Array<Review> = []

  constructor(
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.reviews = await this.userService.getUserReviews(this.user.address)
  }
}
