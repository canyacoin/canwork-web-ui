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
  job: any;
  isOpen: boolean;
  jobSub: Subscription;
  canSee = false;

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
        this.jobSub = this.publicJobsService.getPublicJob(params['jobId']).subscribe(publicJob => {
          if (this.currentUser.address === publicJob.clientId) {
            this.job = publicJob;
            this.isOpen = (this.job.state === JobState.acceptingOffers);
            this.jobId = params['jobId'];
            this.initBids(this.jobId);
            this.canSee = true;
          } else {
            this.canSee = false;
          }
        });
      } else if (params['friendlyUrl']) {
        this.publicJobsService.getPublicJobByUrl(params['friendlyUrl']).then((result) => {
          if (this.currentUser.address === result[0]['clientId']) {
            this.job = result[0];
            this.isOpen = (this.job.state === JobState.acceptingOffers);
            this.jobId = result[0]['id'];
            this.initBids(this.jobId);
            this.canSee = true;
          } else {
            this.canSee = false;
          }
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
  }

  async chooseProvider(bidIndex) {
    const bid = this.bids[bidIndex];
    const confirmed = confirm('Are you sure you want to choose this provider?');
    if (confirmed) {
      const chosen = await this.publicJobsService.closePublicJob(this.job, bid);
      if (chosen) {
        alert('Provider chosen!');
        this.router.navigate(['/inbox/job', this.jobId]);
      } else {
        alert('Something went wrong. please try again later');
      }
    }
  }

  async declineProvider(bidIndex) {
    const bid = this.bids[bidIndex];
    const confirmed = confirm('Are you sure you want to decline this provider\'s offer?');
    if (confirmed) {
      const chosen = await this.publicJobsService.declineBid(this.job, bid);
      if (chosen) {
        alert('Declined!');
      } else {
        alert('Something went wrong. please try again later');
      }
    }
  }
}
