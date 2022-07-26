import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { CanpayModule } from '@canpay-lib/lib'
import { StarRatingModule } from 'angular-star-rating'
import { BootstrapModalModule } from 'ng2-bootstrap-modal'
import { OrderModule } from 'ngx-order-pipe'
import { NgxPaginationModule } from 'ngx-pagination'
import { ClipboardModule } from 'ngx-clipboard'

import { CoreComponentsModule } from '../core-components/core-components.module'
import { CoreServicesModule } from '../core-services/core-services.module'
import { CoreUtilsModule } from '../core-utils/core-utils.module'
import { ChatComponent } from './chat/chat.component'
import { InboxRoutingModule } from './inbox.routing.module'
import { BudgetComponent } from './jobs/components/budget/budget.component'
import { JobDashboardCardComponent } from './jobs/components/job-dashboard-card/job-dashboard-card.component'
import { PropertyComponent } from './jobs/components/property/property.component'
import { StatusIconComponent } from './jobs/components/status-icon/status-icon.component'
import { ActionDialogComponent } from './jobs/container/action-dialog/action-dialog.component'
import { CancelJobComponent } from './jobs/container/cancel-job/cancel-job.component'
import { EnterEscrowBscComponent } from './jobs/container/enter-escrow-bsc/enter-escrow-bsc.component'
import { JobContainerComponent } from './jobs/container/job-container.component'
import { JobDetailsComponent } from './jobs/container/job-details/job-details.component'
import { JobDashboardComponent } from './jobs/dashboard/job-dashboard.component'
import { PostComponent } from './jobs/post/post.component'
import { BscPaymentSelectorComponent } from '../core-components/bsc-payment-selector/bsc-payment-selector.component'

@NgModule({
  imports: [
    BootstrapModalModule,
    CanpayModule,
    CommonModule,
    CoreComponentsModule,
    CoreServicesModule,
    CoreUtilsModule,
    InboxRoutingModule,
    FormsModule,
    OrderModule,
    ReactiveFormsModule,
    StarRatingModule.forChild(),
    NgxPaginationModule,
    ClipboardModule,
  ],
  declarations: [
    ActionDialogComponent,
    BudgetComponent,
    ChatComponent,
    CancelJobComponent,
    EnterEscrowBscComponent,
    JobContainerComponent,
    JobDashboardComponent,
    JobDetailsComponent,
    PostComponent,
    PropertyComponent,
    StatusIconComponent,
    JobDashboardCardComponent,
    BscPaymentSelectorComponent,
  ],
  entryComponents: [ActionDialogComponent],
  exports: [InboxRoutingModule],
})
export class InboxModule {}
