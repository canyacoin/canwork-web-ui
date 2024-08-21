import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { take } from 'rxjs/operators'
import { User } from '@class/user'
import { Job } from '@class/job'
import { AuthService } from '@service/auth.service'
import { ChatService } from '@service/chat.service'
import { PublicJobService } from '@service/public-job.service'

@Component({
  selector: 'invite-job-dialog',
  templateUrl: './invite-job-dialog.component.html',
})
export class InviteJobDialogComponent implements OnInit {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() currentUser: User
  @Input() userModel: User
  @Input() userAddress: string

  currentUserJobs = []
  loadingJobs = false
  inviting = false

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService,
    private publicJobService: PublicJobService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    if (this.currentUser) {
      this.loadingJobs = true
      this.currentUserJobs =
        await this.publicJobService.getOpenPublicJobsByUser(
          this.currentUser.address
        )
      for (let i = 0; i < this.currentUserJobs.length; i++) {
        this.currentUserJobs[i].canInvite =
          await this.publicJobService.canInvite(
            this.currentUserJobs[i].id,
            this.userAddress
          )
      }
      this.loadingJobs = false
      // this.lastPage =
      //   Math.ceil(this.currentUserJobs.length / this.pageLimit) - 1

      if (this.route.snapshot.queryParams['nextAction'] === 'chat')
        this.chatUser()
    }
  }

  ngOnDestroy() {}

  proposeJob() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.router.navigate(['inbox/post', this.userModel.address])
      } else {
        this.router.navigate(['auth/login'])
      }
    })
  }

  // Chat the user without proposing a job
  chatUser() {
    this.authService.currentUser$.pipe(take(1)).subscribe((user: User) => {
      if (user) {
        this.chatService.createNewChannel(this.currentUser, this.userModel)
      } else {
        this.router.navigate(['auth/login'], {
          queryParams: { returnUrl: this.router.url, nextAction: 'chat' },
        })
      }
    })
  }

  async inviteProvider(job, index) {
    this.inviting = true
    const invited = await this.publicJobService.inviteProvider(
      job,
      this.currentUser,
      this.userModel
    )
    if (invited) {
      this.currentUserJobs[index].canInvite = false
      this.inviting = false
      return true
    } else {
      this.inviting = false
      alert('something went wrong')
      return false
    }
  }

  async canInvite(jobId) {
    const result = await this.publicJobService.canInvite(
      jobId,
      this.userModel.address
    )
    return result
  }
}
