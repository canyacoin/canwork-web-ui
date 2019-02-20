import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CanexService } from '../services/canex.service';
import { FormData, FormDataService } from '../services/formData.service';

@Component({
    selector: 'canyalib-canex-receipt'
    , templateUrl: './canex-receipt.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexReceiptComponent implements OnInit, OnDestroy {

    title = 'Booyah! CAN sent.';
    titleSecond = 'Your receipt has been emailed. ';
    @Input() formData: FormData;
    isFormValid = false;
    etherUrl: string;
    message: string;
    orderUrl: string;
    @Output() valueChange = new EventEmitter();
    statusSub: Subscription;

    constructor(private router: Router, private formDataService: FormDataService, private canexService: CanexService) {
    }

    ngOnInit() {
        this.formData = this.formDataService.getFormData();
        this.isFormValid = this.formDataService.isFormValid();
        this.etherUrl = this.canexService.environment.etherscan + this.formData.hash;
        this.orderUrl = this.canexService.environment.order + this.formData.key;
        try {
            this.statusSub = this.canexService.checkStatus(this.formData.key).subscribe(activity => {
                this.formData.hash = activity.hashEthertoAccount;
            }, (error) => {

            });
        } catch (e) {
        }
        this.canexService.sentMail(this.formData.key).subscribe(activity => { });

    }

    ngOnDestroy() {
        if (this.statusSub) { this.statusSub.unsubscribe(); }
    }


    cancel() {
        this.formData.email = '';
        // this.valueChange.emit(Step.none);
    }
}
