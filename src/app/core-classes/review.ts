export class Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  revieweeId: string;
  message: string;
  jobId: string;
  jobTitle: string;
  createdAt: number;
  rating: number;

  constructor(reviewerId: string, reviewerName: string, revieweeId: string, message: string,
    jobId: string, jobTitle: string, createdAt: number, rating: number) {
    this.reviewerId = reviewerId;
    this.reviewerName = reviewerName;
    this.revieweeId = revieweeId;
    this.message = message;
    this.jobId = jobId;
    this.jobTitle = jobTitle;
    this.createdAt = createdAt;
    this.rating = rating;
  }
}

