import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/take';

import { Step } from '../interfaces';
import { CanexService } from '../services/canex.service';
import { FormData, FormDataService, Personal } from '../services/formData.service';
import { ResizeService } from '../services/resize.service';

@Component({
    selector: 'canyalib-canex-payment-options'
    , templateUrl: './canex-payment-options.component.html',
    styleUrls: ['./canex-payment-options.component.css']
})

export class CanexPaymentOptionsComponent implements OnInit, OnDestroy {
    title = 'Please Review and Confirm Your Transaction!';
    workType: boolean;
    form: any;
    isFormValid = false;
    can = false;
    @Input() formData: FormData;
    ethereum = false;
    etherPrice: number;
    key: any;
    status: any;
    error: any;
    tokens: any = [];
    others = false;
    otherstest: any;
    message: string;
    erc20 = false;
    bnb = false;
    gotBnbPrice = false;
    dai = false;
    gotDaiPrice = false;
    validData = false;
    token_classes = '';
    private resizeSubscription: Subscription;
    @Output() valueChange = new EventEmitter();
    personal: Personal;
    @Input() destinationAddress;
    @Input() userEmail;
    @Input() amount: number;
    @Input() balance = 0;

    sessionSub: Subscription;
    cmcSub: Subscription;
    dataSub: Subscription;

    isLoading = true;

    constructor(private router: Router, private resizeService: ResizeService, private formDataService: FormDataService,
        private canexService: CanexService) {
    }

    ngOnInit() {
        if (!this.destinationAddress) {
            this.valueChange.emit(Step.canexError);
        }
        this.workType = this.formDataService.getConfirmation();
        this.formData = this.formDataService.getFormData();
        this.isFormValid = this.formDataService.isFormValid();
        console.log('sending to: ' + this.destinationAddress);
        this.formData.address = this.destinationAddress;
        this.formData.email = this.userEmail;
        this.formData.amount = this.amount - this.balance;

        this.canexService.getSessionId().take(1).subscribe(data => {
            this.key = data.json().token;
            this.status = data.json().status;
            this.isLoading = false;
        });

        this.cmcSub = this.canexService.getDataCmc('ETH').subscribe(
            (data) => {

                this.formData.eth = Number((this.formData.amount * data.json().data.quotes.ETH.price).toFixed(6));
                this.formData.usd = Number((this.formData.amount * data.json().data.quotes.USD.price).toFixed(6));
                // this.etherPrice = this.formData.eth;
            }
        );

        if (window.innerWidth < 769) {
            this.token_classes = 'card-holder col-xs-6 payment-margin-right';
        } else {
            this.token_classes = 'card-holder col-xs-4 payment-margin-right';
        }

        this.resizeSubscription = this.resizeService.onResize$.subscribe(size => {
            if (size.innerWidth < 769) {
                this.token_classes = 'card-holder col-xs-6 payment-margin-right';
            } else {
                this.token_classes = 'card-holder col-xs-4 payment-margin-right';
            }
        });
    }

    ngOnDestroy() {
        if (this.resizeSubscription) { this.resizeSubscription.unsubscribe(); }
        if (this.cmcSub) { this.cmcSub.unsubscribe(); }
        if (this.sessionSub) { this.sessionSub.unsubscribe(); }
        if (this.dataSub) { this.dataSub.unsubscribe(); }
    }

    selectCurrency(currency) {

        this.otherstest = currency;
        this.formData.currency = currency;

        if (currency === 'ETH') {
            this.erc20 = false;
            this.bnb = false;
            this.dai = false;
            this.can = false;
            this.ethereum = !this.ethereum;
            this.others = false;
            this.validData = true;

            if (this.status && this.formData.currency != null) {
                this.error = null;
                this.formData.key = this.key;
                // Navigate to the result page
                this.formData.accept = true;
                this.formDataService.setConfirmation(this.workType);
            } else {
                this.validData = false;
                this.error = 'Oops! something went wrong, Please try again later.';
            }

        } else if (currency === 'bnb') {
            this.gotBnbPrice = false;
            this.ethereum = false;
            this.erc20 = false;
            this.dai = false;
            this.bnb = true;
            this.formData.accept = true;
            this.formData.currency = 'Binance Coin';
            this.formData.erc20token = '0xb8c77482e45f1f44de1745f52c74426c631bdd52';
            this.formData.erc20tokenDecimal = '18';

            this.dataSub = this.canexService.getData('BNB').subscribe(
                (data) => {
                    const price = data.json().data.price * + this.formData.amount;
                    this.formData.eth = Number(price.toFixed(6));
                    this.gotBnbPrice = true;
                }
            );
            if (this.status && this.formData.currency != null) {
                this.validData = true;
                this.error = null;
                this.formData.key = this.key;
                // Navigate to the result page
                this.formDataService.setConfirmation(true);
            } else {
                this.validData = false;
            }
        } else if (currency === 'dai') {
            this.gotDaiPrice = false;
            this.ethereum = false;
            this.erc20 = false;
            this.dai = true;
            this.bnb = false;
            this.formData.accept = true;
            this.formData.currency = 'Dai';
            this.formData.erc20token = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';
            this.formData.erc20tokenDecimal = '18';

            this.dataSub = this.canexService.getData('DAI').subscribe(
                (data) => {
                    const price = data.json().data.price * + this.formData.amount;
                    this.formData.eth = Number(price.toFixed(6));
                    this.gotDaiPrice = true;
                }
            );
            if (this.status && this.formData.currency != null) {
                this.validData = true;
                this.error = null;
                this.formData.key = this.key;
                // Navigate to the result page
                this.formDataService.setConfirmation(true);
            } else {
                this.validData = false;
            }
        } else {
            this.ethereum = false;
            this.bnb = false;
            this.dai = false;
            this.erc20 = !this.erc20;
            this.others = false;

        }
    }

    save(form: any): boolean {
        if (!form.valid) {
            return false;
        }

        this.formDataService.setConfirmation(this.workType);
        return true;
    }

    goToPrevious() {
        this.valueChange.emit(Step.balanceCheck);
    }

    next() {
        if (this.erc20) {
            this.valueChange.emit(Step.canexErc20);
        } else if (this.validData && ((this.bnb && this.gotBnbPrice) || (this.dai && this.gotDaiPrice))) {
            this.valueChange.emit(Step.canexQr);
        } else if (this.validData && this.ethereum) {
            this.valueChange.emit(Step.canexQr);
        }
    }
    get enableButton() {
        return (this.validData && this.ethereum) || (this.validData && ((this.bnb && this.gotBnbPrice) || (this.dai && this.gotDaiPrice))) || this.erc20;
    }

    cancel() {
        this.formData.email = '';
        // this.valueChange.emit(Step.none);
    }
}
