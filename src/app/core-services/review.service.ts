import { Injectable } from '@angular/core'
import { Job } from '@class/job'
import { IJobAction } from '@class/job-action'
import { Review } from '@class/review'
import { Rating, User } from '@class/user'
import { UserService } from '@service/user.service'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore'
import { Observable, Subscribable } from 'rxjs'
import { map, take } from 'rxjs/operators'

import * as moment from 'moment-timezone'

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  reviewsCollectionRef: AngularFirestoreCollection<any>

  constructor(private afs: AngularFirestore, private userService: UserService) {
    this.reviewsCollectionRef = this.afs.collection<any>('reviews')
  }

  async newReview(
    reviewer: User,
    reviewee: User,
    job: Job,
    action: IJobAction
  ): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      const review = new Review(
        reviewer.address,
        reviewer.name,
        reviewee.address,
        action.message,
        job.id,
        job.information.title,
        parseInt(moment().format('x'), 10),
        action.rating
      )
      try {
        const ref = await this.reviewsCollectionRef.add({ ...review })
        reviewee.rating = await this.calculateAverageRating(reviewee.address)
        this.userService.saveUser(reviewee)
        resolve(true)
      } catch (error) {
        reject()
      }
    })
  }

  async calculateAverageRating(userId: string): Promise<Rating> {
    const reviews = await this.getUserReviews(userId)
    if (reviews) {
      let total = 0
      reviews.forEach((review) => {
        total += review.rating
      })
      const average = total / reviews.length
      return {
        count: reviews.length,
        average: Math.round(average * 2) / 2,
      } as Rating
    }
    return { count: 0, average: 0 } as Rating
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    const reviews = await this.reviewsCollectionRef.ref
      .where('revieweeId', '==', userId)
      .get()

    return new Promise<Review[]>((resolve, reject) => {
      if (reviews.empty) {
        resolve([])
      } else {
        resolve(reviews.docs.map((a) => a.data() as Review))
      }
    })
  }

  getJobReviews(jobId: string): Observable<Review[]> {
    const collection = this.afs.collection<any>('reviews', (ref) =>
      ref.where('jobId', '==', jobId)
    )
    return collection.snapshotChanges().pipe(
      map((changes) => {
        return changes.map((a) => {
          return a.payload.doc.data() as Review
        })
      })
    )
  }
}
