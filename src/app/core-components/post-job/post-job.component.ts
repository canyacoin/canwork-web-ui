import { Component } from '@angular/core'
import { PostJobService } from 'app/shared/constants/home-page'

@Component({
  selector: 'post-job',
  templateUrl: './post-job.component.html',
})
export class PostJobComponent {
  postSection = PostJobService
}
