import { Component, Input, Output, EventEmitter } from '@angular/core'
import { Review } from '@class/review'
import { UserType } from '@class/user'

@Component({
  selector: 'job-review-panel',
  templateUrl: './job-review-panel.component.html',
})
export class JobReviewPanelComponent {
  @Input() reviews!: Review[]
  @Input() currentUserType!: UserType
  @Output() reviewBtnEvent = new EventEmitter<Event>()
  @Input() userCanReview: boolean = false

  buttonClick(event: Event) {
    event.preventDefault()
    this.reviewBtnEvent.emit(event)
  }

  get noReviewDescription() {
    if (this.currentUserType === UserType.provider) {
      if (this.userCanReview)
        return `To veiw the client's review, you should leave a review on your side.`
      else
        return `You have already submitted the review.
                Please wait until the client gives   you a review.`
    } else {
      if (this.userCanReview)
        return `To veiw the freelancer's review, you should leave a review on your side.`
      else
        return `You have already submitted the review.
                Please wait until the freelancer gives you a review.`
    }
  }
}
