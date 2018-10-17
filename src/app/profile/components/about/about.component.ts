import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '@class/user';
import { AuthService } from '@service/auth.service';
import { ChatService } from '@service/chat.service';

@Component({
  selector: 'app-profile-about',
  templateUrl: './about.component.html',
  styleUrls: ['../../profile.component.scss']
})
export class AboutComponent implements OnInit {

  @Input() currentUser: User;
  @Input() userModel: User;
  @Input() isMyProfile: boolean;

  @Output() editProfile = new EventEmitter()

  constructor(
    private router: Router,
    private authService: AuthService,
    private chatService: ChatService) { }

  ngOnInit() { }

  displayProfileEditComponent() {
    this.editProfile.emit(true)
  }

  proposeJob() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      if (user) {
        this.router.navigate(['inbox/post', this.userModel.address]);
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }

  // Chat the user without proposing a job
  chatUser() {
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      if (user) {
        this.chatService.createNewChannel(this.currentUser, this.userModel);
      } else {
        this.router.navigate(['auth/login']);
      }
    });
  }
}
