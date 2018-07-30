import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { User } from '../../../core-classes/user';
import { AuthService } from '../../../core-services/auth.service';
import { ProfileComponent } from '../../profile.component';
import { ChatService } from '../../../core-services/chat.service';
@Component({
  selector: 'app-profile-about',
  templateUrl: './about.component.html',
  styleUrls: ['../../profile.component.css']
})
export class AboutComponent implements OnInit {
  @Input() currentUser: User;
  @Input() userModel: User;
  @Input() isMyProfile: boolean;

  constructor(private router: Router, private authService: AuthService, private chatService : ChatService) { }

  ngOnInit() { }

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
  chatUser(){
    this.authService.currentUser$.take(1).subscribe((user: User) => {
      if (user) {
        console.log("This user is logged in");
        this.chatService.createNewChannel(this.currentUser,this.userModel);
      } else {
        this.router.navigate(['auth/login']);
      } 
    });
  } 
   
}

