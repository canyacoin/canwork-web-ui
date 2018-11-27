import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { User } from '@class/user';
import { Job } from '@class/job';
import { AuthService } from '@service/auth.service';
import { ChatService } from '@service/chat.service';
import { PublicJobService } from '@service/public-job.service';

@Component({
  selector: 'app-profile-about',
  templateUrl: './about.component.html',
  styleUrls: ['../../profile.component.scss']
})
export class AboutComponent implements OnInit {

  @Input() currentUser: User;
  @Input() userModel: User;
  @Input() isMyProfile: boolean;

  @Output() editProfile = new EventEmitter();

  currentUserJobs = null;
  pageLimit = 3;
  currentPage = 0;
  lastPage = 0;
  animation = 'fadeIn';

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private publicJobService: PublicJobService) { }

  async ngOnInit() {
    this.publicJobService.getPublicJobsByUser(this.currentUser.address).subscribe(async (jobs: Job[]) => {
      this.currentUserJobs = jobs.filter(job => job.state === 'Accepting Offers' && job.draft !== true);
      this.lastPage = (Math.ceil(this.currentUserJobs.length / this.pageLimit) - 1);
      console.log(this.currentUserJobs);
    });
  }

  displayProfileEditComponent() {
    this.editProfile.emit(true);
  }

  proposeJob() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.router.navigate(['inbox/post', this.userModel.address]);
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }

  paginatedUserJobs() {
    const paginated = this.currentUserJobs.slice((this.currentPage * this.pageLimit), ((this.currentPage * this.pageLimit) + this.pageLimit));
    return paginated;
  }

  nextPage() {
    this.animation = 'fadeOut';
    setTimeout(() => {
      this.currentPage++;
      this.animation = 'fadeIn';
    }, 300);
  }

  previousPage() {
    this.animation = 'fadeOut';
    setTimeout(() => {
      this.currentPage--;
      this.animation = 'fadeIn';
    }, 300);
  }

  // Chat the user without proposing a job
  chatUser() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.chatService.createNewChannel(this.currentUser, this.userModel);
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }
}
