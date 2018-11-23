import { Component, OnInit } from '@angular/core';
import { Bid, Job, JobState } from '@class/job';
import { User, UserType } from '@class/user';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@service/auth.service';
import { PublicJobService } from '@service/public-job.service';
import { UserService } from '@service/user.service';
import { AngularFireStorage } from 'angularfire2/storage';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-job-bids',
  templateUrl: './job-bids.component.html',
  styleUrls: ['./job-bids.component.css']
})
export class JobBidsComponent implements OnInit {
  authSub: Subscription;
  currentUser: User;
  bids: any;
  jobId: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private publicJobsService: PublicJobService,
    private storage: AngularFireStorage,
    private router: Router) { }

  async ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
    });
    this.activatedRoute.params.pipe(take(1)).subscribe((params) => {
      if (params['jobId']) {
        this.jobId = params['jobId'];
        this.initBids(this.jobId);
      } else if (params['friendlyUrl']) {
        this.publicJobsService.getPublicJobByUrl(params['friendlyUrl']).then((result) => {
          this.jobId = result[0]['id'];
          this.initBids(this.jobId);
        });
      }
    });
  }

  async getProviderData(id) {
    const provider = await this.userService.getUser(id);
    return provider;
  }

  async initBids(jobId) {
    this.bids = await this.publicJobsService.getBids(jobId);
    console.log(this.bids[0].providerInfo.skillTags);
  }
}
