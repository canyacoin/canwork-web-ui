import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgArrayPipesModule } from 'ngx-pipes' // https://www.npmjs.com/package/ngx-pipes#array

//import { SimpleModalModule } from 'ngx-simple-modal' // old module
import { NgxModalView } from 'ngx-modalview'

import { StarRatingModule } from 'angular-star-rating'
//import { OrderModule } from 'ngx-order-pipe'
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
import { ToastModule } from 'primeng/toast'
import { EditorModule } from 'primeng/editor';
import { HttpClientModule} from '@angular/common/http';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
@NgModule({
  imports: [
    CommonModule,
    ToastModule,
    //SimpleModalModule, // old
    NgxModalView, // new
    CoreComponentsModule,
    NgArrayPipesModule,
    CoreServicesModule,
    CoreUtilsModule,
    InboxRoutingModule,
    FormsModule,
    // OrderModule,
    ReactiveFormsModule,
    StarRatingModule.forChild(),
    NgxPaginationModule,
    ClipboardModule,
    EditorModule,
    HttpClientModule,
    AngularEditorModule,
    DropdownModule,
    CalendarModule
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
  exports: [InboxRoutingModule],
})
export class InboxModule {}
