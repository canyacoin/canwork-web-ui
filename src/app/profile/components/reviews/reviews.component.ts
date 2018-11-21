import { Component, Input, OnInit } from '@angular/core';
import { Review } from '@class/review';
import { User } from '@class/user';
import { ReviewService } from '@service/review.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  @Input() user: User;

  reviews: Array<Review> = [];

  constructor(
    private reviewService: ReviewService
  ) { }

  async ngOnInit() {
    this.reviews = await this.reviewService.getUserReviews(this.user.address);
  }
}
