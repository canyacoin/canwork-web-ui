import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { QRCodeModule } from 'angular2-qrcode'
import { BootstrapModalModule } from 'ng2-bootstrap-modal'
import { ClipboardModule } from 'ngx-clipboard'

import { ResizeService } from './services/resize.service'
import { LoaderComponent } from './canpay-loader/loading-status.component'
import { CanpayModalComponent } from './canpay-modal/canpay-modal.component'
import { CanpayWizardComponent } from './canpay-wizard/canpay-wizard.component'
import { CommaSepNumPipe } from './comma-sep-num.pipe'
import { EtherscanLinkComponent } from './etherscan-link/etherscan-link.component'
import { LoadingStatusComponent } from './loading-status/loading-status.component'
import { MsgBoxComponent } from './msg-box/msg-box.component'
import { PaymentSummaryTemplateComponent } from './payment-summary-template/payment-summary-template.component'
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component'
import { CanexService } from './services/canex.service'
import { CanPayService } from './services/canpay.service'
import { FormDataService } from './services/formData.service'

const COMPONENTS = [
  CanpayModalComponent,
  CanpayWizardComponent,
  LoadingStatusComponent,
  PaymentSummaryComponent,
  PaymentSummaryTemplateComponent,
  MsgBoxComponent,
  CommaSepNumPipe,
  EtherscanLinkComponent,
  LoaderComponent,
]

const PROVIDERS = [CanPayService, FormDataService, ResizeService, CanexService]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    ClipboardModule,
    QRCodeModule,
  ],
  entryComponents: [CanpayModalComponent],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: PROVIDERS,
})
export class CanpayModule {}
