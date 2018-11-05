import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AnimationService } from './animation.service';
import { ChatService } from './chat.service';
import { FeatureToggleService } from './feature-toggle.service';
import { FeedService } from './feed.service';
import { JobService } from './job.service';
import { MomentService } from './moment.service';
import { ScriptService } from './script.service';
import { TransactionService } from './transaction.service';
import { UploadService } from './upload.service';
import { UserService } from './user.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AnimationService,
    ChatService,
    FeedService,
    FeatureToggleService,
    JobService,
    MomentService,
    ScriptService,
    TransactionService,
    UploadService,
    UserService
  ]
})
export class CoreServicesModule { }
