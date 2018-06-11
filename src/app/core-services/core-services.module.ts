import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnimationService } from './animation.service';
// import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
// import { EthService } from './eth.service';
import { FeedService } from './feed.service';
import { MomentService } from './moment.service';
import { ScriptService } from './script.service';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AnimationService,
    // AuthService,
    ChatService,
    // EthService,
    FeedService,
    MomentService,
    ScriptService,
    UserService
  ]
})
export class CoreServicesModule { }
