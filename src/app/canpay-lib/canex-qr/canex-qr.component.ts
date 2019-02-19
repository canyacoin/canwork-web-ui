import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import 'rxjs/add/operator/take';

import { Step } from '../interfaces';
import { CanexService } from '../services/canex.service';
import { CanYaCoinEthService } from '../services/canyacoin-eth.service';
import { FormData, FormDataService, Personal } from '../services/formData.service';

declare var require: any;
const Web3 = require('web3');
declare var web3;
declare let window: any;
const gasStationApi = 'https://ethgasstation.info/json/ethgasAPI.json';

@Component({
    selector: 'canyalib-canex-qr'
    , templateUrl: './canex-qr.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexQRComponent implements OnInit, OnDestroy {

    title = 'Pay exactly';
    @Input() formData: FormData;
    isFormValid = false;
    activities: any[] = [];
    dataSuccess: any;
    personal: Personal;
    copied: boolean;
    ethStatus = false;
    status: string;
    public web3: any;
    ethereumAddress: string = this.canexService.environment.backendEthAddress;
    metamaskpayment = false;
    tokenABI: any;
    public MyContract: any;
    web3js: any;
    canyaContract: any;
    message: string;
    orderUrl: string;
    @Output() valueChange = new EventEmitter();

    statusInterval: any;
    addressSub: Subscription;
    gasSub: Subscription;

    constructor(protected http: Http, private canexService: CanexService,
        private router: Router, private formDataService: FormDataService, private route: Router, private canYaCoinEthService: CanYaCoinEthService) {

        try {
            this.statusInterval = setInterval(() => {
                this.canexService.checkStatus(this.formData.key).subscribe(activity => {
                    try {
                        if (activity.json().status === 'IDENTIFIED') {
                            this.valueChange.emit(Step.canexProcessing);

                        } else if (activity.json().status === 'ERROR') {
                            this.valueChange.emit(Step.canexError);
                        }
                    } catch (e) { }
                }, (error) => { });
            }, 2000);
        } catch (e) {

        }
    }

    ngOnInit() {

        this.copied = false;
        this.formData = this.formDataService.getFormData();
        if (!this.formData.key || this.formData.key === '') {
            this.valueChange.emit(Step.canexError);
        }
        this.orderUrl = this.canexService.environment.order + this.formData.key;

        this.isFormValid = this.formDataService.isFormValid();
        this.personal = this.formDataService.getPersonal();

        if (this.formData.currency === 'ETH') {
            this.ethStatus = true;
        }
        this.metamaskEnable();

        this.canexService.save(this.formData).subscribe(activity => { });
    }

    ngOnDestroy() {
        if (this.statusInterval) { clearInterval(this.statusInterval); }
        if (this.addressSub) { this.addressSub.unsubscribe(); }
        if (this.gasSub) { this.gasSub.unsubscribe(); }
    }

    submit() {
        alert('Done!');
        this.title = 'TX successful';
        this.formData = this.formDataService.resetFormData();
        this.isFormValid = false;
    }

    copyToClipboard(element) {
        this.copied = true;

        setTimeout(() => {
            this.copied = false;
        }, 1000);
    }

    metamask() {

        if (this.formData.currency === 'ETH') {
            this.canYaCoinEthService.payWithEther(this.formData.eth, this.canexService.environment.backendEthAddress);
        } else {
            this.gasSub = this.canexService.getGasPrice().subscribe(activity => {
                this.canYaCoinEthService.payWithERC20(this.formData.eth, this.canexService.environment.backendEthAddress,
                    this.formData.erc20token, this.formData.erc20tokenDecimal, activity.json().fast + '000');
            });
        }
    }

    metamaskEnable() {
        this.metamaskpayment = true;
    }
}
