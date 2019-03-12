import { Component, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { Subscription } from 'rxjs';

import { Step } from '../interfaces';
import { FormData, FormDataService, Personal } from '../services/formData.service';

declare var BancorConvertWidget: any;

export enum Status {
  New,
  PendingPurchase,
  InProgress,
  Completed
}

@Component({
  selector: 'canyalib-balance-check',
  templateUrl: './balance-check.component.html',
  styleUrls: ['./balance-check.component.css']
})
export class BalanceCheckComponent implements OnInit {
  @Output() check = new EventEmitter();
  @Output() valueChange = new EventEmitter();
  @Input() balance = 0;
  @Input() paymentSummary;
  @Input() amount = 0;
  @Input() disableCanEx;
  @Input() isLoading;

  type = 'WITHOUT_INPUT_BOXES';
  Status = Status;
  status: Status = Status.New;

  isLoadingBancorWidget = false;

  widget: any;


  constructor(private renderer: Renderer2) { }

  ngOnInit() {
    this.initBancor();
  }

  initBancor() {
    if (this.isBancorLoaded()) { return; }

    this.isLoadingBancorWidget = true;
    this.addJsToElement('https://widget-convert.bancor.network/v1').onload = () => {
      console.log('BancorConvertWidget Tag loaded');
      this.isLoadingBancorWidget = false;
      this.initBancorWidget();
    };
  }

  initBancorWidget() {
    if (!this.isBancorLoaded()) { return; }

    this.widget = BancorConvertWidget.createInstance({
      'type': '0',
      'blockchainType': 'ethereum',
      'baseCurrencyId': '5a6f61ece3de16000123763a',
      'pairCurrencyId': '5937d635231e97001f744267',
      'primaryColor': '#00BFFF',
      'primaryColorHover': '55DAFB',
      'widgetContainerId': 'bancor-wc-id-1',
      'displayCurrency': 'ETH'
    });
  }

  isBancorLoaded() {
    try {
      if (BancorConvertWidget) { return true; }
    } catch (e) { console.log('BancorConvertWidget is not initialized'); }

    return false;
  }

  public callCanex() {
    this.valueChange.emit(Step.canexPaymentOptions);
  }

  addJsToElement(src: string): HTMLScriptElement {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    this.renderer.appendChild(document.body, script);
    return script;
  }

  open() {
    this.widget.showConvertPopup('buy');
    this.status = Status.PendingPurchase;
  }

  checkBalance() {
    console.log('in checkBalance');
    this.status = Status.InProgress;
    setTimeout(() => this.check.emit(), 2000);
  }

  cancel() {
    this.status = Status.New;
  }
}
