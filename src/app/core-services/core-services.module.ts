import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth.service';
import { FeedService } from './feed.service';
import { MomentService } from './moment.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [
    AuthService,
    FeedService,
    MomentService
  ]
})
export class CoreServicesModule { }
