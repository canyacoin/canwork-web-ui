import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/take';

import { Step } from '../interfaces';
import { CanexService } from '../services/canex.service';
import { FormData, FormDataService } from '../services/formData.service';
import { ResizeService } from '../services/resize.service';

@Component({
    selector: 'canyalib-canex-erc20'
    , templateUrl: './canex-erc20.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexERC20Component implements OnInit, OnDestroy {
    title = 'Please Review and Confirm Your Transaction!';
    workType: boolean;
    form: any;
    @Input() formData: FormData;
    isFormValid = false;
    can = false;
    ethereum = false;
    etherPrice: number;
    key: any;
    status: any;
    error: any;
    tokens: any = [];
    filteredTokens: any = [];
    others = false;
    otherstest: any;
    selectedERC: string;
    price: any;
    message: string;
    token_classes = '';
    private resizeSubscription: Subscription;
    private sessionSub: Subscription;
    private dataSub: Subscription;
    listStatus = true;

    @Output() valueChange = new EventEmitter();

    constructor(private router: Router, private resizeService: ResizeService,
        private formDataService: FormDataService, private canexService: CanexService) {
    }

    search(val) {
        // for erc token search
        if (val) {
            this.filteredTokens = this.tokens.filter(c => c.name.toUpperCase().match(val.toUpperCase()) || c.symbol.toUpperCase().match(val.toUpperCase()));
        } else {
            this.filteredTokens = this.tokens;
        }
    }

    ngOnInit() {
        this.workType = this.formDataService.getConfirmation();
        this.formData = this.formDataService.getFormData();
        this.isFormValid = this.formDataService.isFormValid();

        // get list of supported erc20 tokens
        this.canexService.getTokensBancor().take(1).subscribe(data => {
            const tokenData1 = data;
            this.listStatus = false;
            for (const result of data.json()) {
                this.tokens.push(result);
                this.filteredTokens.push(result);
            }
        });

        // get status
        this.sessionSub = this.canexService.getSessionId().subscribe(data => {
            this.key = data.json().token;
            this.status = data.json().status;
        });

        if (window.innerWidth < 769) {
            this.token_classes = 'card-holder col-xs-6';
        } else {
            this.token_classes = 'card-holder col-xs-4';
        }

        this.resizeSubscription = this.resizeService.onResize$.subscribe(size => {
            if (size.innerWidth < 769) {
                this.token_classes = 'card-holder col-xs-6';
            } else {
                this.token_classes = 'card-holder col-xs-4';
            }
        });
    }

    ngOnDestroy() {
        if (this.sessionSub) { this.sessionSub.unsubscribe(); }
        if (this.dataSub) { this.dataSub.unsubscribe(); }

    }

    // to convert erc20 token to CAN
    selectCurrency(form, key) {
        this.formData.eth = null;
        this.selectedERC = form.symbol;
        this.otherstest = form.name;
        this.formData.currency = form.name;
        this.formData.erc20token = form.address;
        this.formData.erc20tokenDecimal = form.decimals;
        this.others = !this.others;

        this.dataSub = this.canexService.getData(form.symbol).subscribe(
            (data) => {
                const price = data.json().data.price * + this.formData.amount;
                this.price = price;
                this.formData.eth = Number(price.toFixed(6));
                this.etherPrice = Number(price.toFixed(6));
            }
        );


        if (this.status && this.formData.currency != null) {
            this.error = null;
            this.formData.key = key;
            // Navigate to the result page
            this.formData.accept = true;
        } else {
            this.error = 'Oops! something went wrong, Please try again later.';
        }
    }

    save(form: any): boolean {
        if (!form.valid) {
            return false;
        }

        this.formDataService.setConfirmation(this.workType);
        return true;
    }

    get nextButtonDisabled(): boolean {
        return !this.status || this.formData.currency === 'erc20' || !this.formData.eth;

    }


    goToNext(form: any, key: any) {

        if (this.save(form) && this.status && this.formData.currency !== 'erc20') {
            this.error = null;
            this.formData.key = key;
            // Navigate to the result page
            this.formData.accept = true;
            this.valueChange.emit(Step.canexQr);

        } else {
            this.error = 'Please select a token';
        }
    }
}
