import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { HttpModule } from '@angular/http'
import { QRCodeModule } from 'angular2-qrcode'
import { BootstrapModalModule } from 'ng2-bootstrap-modal'
import { ClipboardModule } from 'ngx-clipboard'
import { CanpayWizardComponent } from './canpay-wizard/canpay-wizard.component'
import { MsgBoxComponent } from './msg-box/msg-box.component'
import { PaymentSummaryTemplateComponent } from './payment-summary-template/payment-summary-template.component'
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component'
import { FormDataService } from './services/formData.service'

const COMPONENTS = [
  CanpayWizardComponent,
  PaymentSummaryComponent,
  PaymentSummaryTemplateComponent,
  MsgBoxComponent,
]

const PROVIDERS = [FormDataService]

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
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: PROVIDERS,
})
export class CanpayModule {}
