import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Observable, Subscription } from 'rxjs';
import 'rxjs/add/operator/take';

import { Step } from '../interfaces';
import { CanexService } from '../services/canex.service';
import { FormData, FormDataService, Personal } from '../services/formData.service';

@Component({
    selector: 'canyalib-canex-processing'
    , templateUrl: './canex-processing.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexProcessingComponent implements OnInit, OnDestroy {
    title = 'Booyah! CAN sent.';
    titleSecond = 'Your receipt has been emailed. ';
    @Input() formData: FormData;
    @Input() postBalanceStep: Step;
    isFormValid = false;
    etherUrl: string;
    personal: Personal;
    activities: any[] = [];
    message: string;
    orderUrl: string;
    @Output() valueChange = new EventEmitter();
    @Output() purchaseComplete = new EventEmitter();

    statusInterval: any;
    statusSub: Subscription;

    constructor(private router: Router, private formDataService: FormDataService,
        private canexService: CanexService) {
        this.statusInterval = setInterval(() => {
            try {
                if (this.statusSub) { this.statusSub.unsubscribe(); }
                this.statusSub = this.canexService.checkStatus(this.formData.key).subscribe(activity => {
                    try {
                        if (activity.json().status === 'COMPLETE') {
                            this.purchaseComplete.emit();
                        } else if (activity.json().status === 'ERROR') {
                            this.valueChange.emit(Step.canexError);
                        }
                    } catch (e) {

                    }
                });
            } catch (e) {
            }
        }, 2000);
    }

    ngOnInit() {
        this.formData = this.formDataService.getFormData();
        this.isFormValid = this.formDataService.isFormValid();
        this.etherUrl = 'https://etherscan.io/tx/' + this.formData.hash;
        this.orderUrl = 'http://staging.canexchange.io/#/order/' + this.formData.key;
        this.canexService.sentMailStaging(this.formData.key).subscribe(activity => { });
    }

    ngOnDestroy() {
        if (this.statusInterval) { clearInterval(this.statusInterval); }
        if (this.statusSub) { this.statusSub.unsubscribe(); }
    }

    cancel() {
        this.formData.email = '';
        // this.valueChange.emit(Step.none);
    }

    submit() {
        this.title = 'TX successful';
        this.formData = this.formDataService.resetFormData();
        this.isFormValid = false;
        this.router.navigate(['./']);
    }
}
