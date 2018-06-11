import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';

import { User } from '../../core-classes/user';
import { AuthService } from '../../core-services/auth.service';
import { ChatService } from '../../core-services/chat.service';
import { UserService } from '../../core-services/user.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {

  currentUser: User;
  authSub: Subscription;

  postForm: FormGroup = null;

  recipientAddress = '';
  recipient: User = null;

  isSending = false;
  sent = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private chatService: ChatService) {
    this.postForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      budget: ['', Validators.compose([Validators.required, Validators.min(10), Validators.maxLength(9999)])]
    });
  }

  ngOnInit() {
    this.authSub = this.authService.currentUser$.subscribe((user: User) => {
      this.currentUser = user;
      this.activatedRoute.params.take(1).subscribe((params) => {
        if (params['address'] && params['address'] !== this.currentUser.address) {
          this.recipientAddress = params['address'];
          this.loadUser(this.recipientAddress);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.authSub) { this.authSub.unsubscribe(); }
  }

  loadUser(address: string) {
    try {
      this.userService.getUser(address).then((user: User) => {
        this.recipient = user;
      });
    } catch (error) {
      console.error('error loading user', error);
    }
  }

  async submitForm() {
    this.isSending = true;
    const channelId = await this.chatService.createChannelsAsync(this.currentUser, this.recipient);
    if (channelId) {
      this.chatService.sendNewPostMessages(channelId, this.currentUser, this.recipient, this.postForm.value.description, this.postForm.value.budget);
      this.isSending = false;
      this.sent = true;
    } else {
      this.isSending = false;
    }
  }
}
