import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { OrderModule } from 'ngx-order-pipe';

import { CoreComponentsModule } from '../core-components/core-components.module';
import { CoreServicesModule } from '../core-services/core-services.module';
import { ChatComponent } from './chat/chat.component';
import { InboxRoutingModule } from './inbox.routing.module';
import { JobDashboardCardComponent } from './jobs/components/job-dashboard-card/job-dashboard-card.component';
import { BudgetComponent } from './jobs/components/budget/budget.component';
import { PropertyComponent } from './jobs/components/property/property.component';
import { StatusIconComponent } from './jobs/components/status-icon/status-icon.component';
import { ActionDialogComponent } from './jobs/container/action-dialog/action-dialog.component';
import { ActionHistoryComponent } from './jobs/container/action-history/action-history.component';
import { JobContainerComponent } from './jobs/container/job-container.component';
import { JobDetailsComponent } from './jobs/container/job-details/job-details.component';
import { JobDashboardComponent } from './jobs/dashboard/job-dashboard.component';
import { PostComponent } from './jobs/post/post.component';

@NgModule({
  imports: [
    BootstrapModalModule,
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    InboxRoutingModule,
    FormsModule,
    OrderModule,
    ReactiveFormsModule
  ],
  declarations: [
    ActionDialogComponent,
    ActionHistoryComponent,
    BudgetComponent,
    ChatComponent,
    JobContainerComponent,
    JobDashboardComponent,
    JobDetailsComponent,
    PostComponent,
    PropertyComponent,
    StatusIconComponent,
    JobDashboardCardComponent
  ],
  entryComponents: [
    ActionDialogComponent
  ],
  exports: [
    InboxRoutingModule
  ]
})
export class InboxModule { }
