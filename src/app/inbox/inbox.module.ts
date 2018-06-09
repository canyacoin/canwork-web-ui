import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { ChatComponent } from './chat/chat.component';
import { InboxRoutingModule } from './inbox.routing.module';
import { PostComponent } from './post/post.component';

@NgModule({
  imports: [
    CommonModule,
    CoreComponentsModule,
    CoreComponentsModule,
    InboxRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    ChatComponent,
    PostComponent
  ],
  exports: [
    InboxRoutingModule
  ]
})
export class InboxModule { }
