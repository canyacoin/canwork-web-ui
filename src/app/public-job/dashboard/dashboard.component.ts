import { Component, OnInit } from '@angular/core';
import { PublicJobService } from '@service/public-job.service';
import { AuthService } from '@service/auth.service';
import { Job, JobDescription, JobState } from '@class/job';
import { Subscription } from 'rxjs';
import { User, UserType } from '@class/user';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  allJobs: any;
  authSub: Subscription;
  currentUser: User;
  reverseOrder = false;
  constructor(
    private publicJobService: PublicJobService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      if (this.currentUser !== user) {
        this.currentUser = user;
      }
    });
    this.publicJobService.getAllOpenJobs().subscribe(result => {
      this.allJobs = result;
    });
  }
  get isProvider(): boolean {
    return this.currentUser.type === UserType.provider;
  }
}
