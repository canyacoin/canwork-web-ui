import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { QRCodeModule } from 'angular2-qrcode';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { ClipboardModule } from 'ngx-clipboard';

import { ResizeService } from '../lib/services/resize.service';
import { BalanceCheckComponent } from './balance-check/balance-check.component';
import { CanexERC20Component } from './canex-erc20/canex-erc20.component';
import { CanexErrorComponent } from './canex-error/canex-error.component';
import { CanexOrderStatusComponent } from './canex-order-status/canex-order-status.component';
import {
    CanexPaymentOptionsComponent
} from './canex-payment-options/canex-payment-options.component';
import { CanexProcessingComponent } from './canex-processing/canex-processing.component';
import { CanexQRComponent } from './canex-qr/canex-qr.component';
import { CanexReceiptComponent } from './canex-receipt/canex-receipt.component';
import { LoaderComponent } from './canpay-loader/loading-status.component';
import { CanpayModalComponent } from './canpay-modal/canpay-modal.component';
import { CanpayWizardComponent } from './canpay-wizard/canpay-wizard.component';
import { CommaSepNumPipe } from './comma-sep-num.pipe';
import { EtherscanLinkComponent } from './etherscan-link/etherscan-link.component';
import { InputAmountComponent } from './input-amount/input-amount.component';
import { LoadingStatusComponent } from './loading-status/loading-status.component';
import { InstructionsComponent } from './metamask/instructions/instructions.component';
import { MetamaskComponent } from './metamask/metamask.component';
import { MsgBoxComponent } from './msg-box/msg-box.component';
import {
    PaymentAuthorisationComponent
} from './payment-authorisation/payment-authorisation.component';
import {
    PaymentSummaryTemplateComponent
} from './payment-summary-template/payment-summary-template.component';
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component';
import { PaymentComponent } from './payment/payment.component';
import { ProcessComponent } from './process/process.component';
import { CanexService } from './services/canex.service';
import { CanPayService } from './services/canpay.service';
import { CanYaCoinEthService } from './services/canyacoin-eth.service';
import { EthService } from './services/eth.service';
import { FormDataService } from './services/formData.service';

const COMPONENTS = [
  CanpayModalComponent,
  CanpayWizardComponent,
  MetamaskComponent,
  InstructionsComponent,
  LoadingStatusComponent,
  BalanceCheckComponent,
  PaymentAuthorisationComponent,
  PaymentComponent,
  PaymentSummaryComponent,
  PaymentSummaryTemplateComponent,
  ProcessComponent,
  MsgBoxComponent,
  InputAmountComponent,
  CommaSepNumPipe,
  CanexOrderStatusComponent,
  CanexPaymentOptionsComponent,
  CanexProcessingComponent,
  CanexERC20Component,
  CanexReceiptComponent,
  CanexQRComponent,
  CanexErrorComponent,
  EtherscanLinkComponent,
  LoaderComponent
];

const PROVIDERS = [
  EthService, CanYaCoinEthService, CanPayService, FormDataService,
  ResizeService, CanexService
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    ClipboardModule,
    QRCodeModule
  ],
  entryComponents: [
    CanpayModalComponent,
    CanexOrderStatusComponent
  ],
  declarations: COMPONENTS,
  exports: COMPONENTS,
  providers: PROVIDERS
})
export class CanpayModule {
  static forRoot(config: any): ModuleWithProviders {
    return {
      ngModule: CanpayModule,
      providers: [{ provide: 'Config', useValue: config }]
    };
  }
}
