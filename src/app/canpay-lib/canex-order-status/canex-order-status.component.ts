import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { CanexService } from '../services/canex.service';
import { FormData, Personal } from '../services/formData.service';

@Component({
    selector: 'canyalib-canex-order-status'
    , templateUrl: './canex-order-status.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexOrderStatusComponent implements OnInit, OnDestroy {
    // title = 'Thanks for staying tuned!';
    title = 'Order Page.';
    titleSecond = 'Your receipt has been emailed. ';
    @Input() formData: FormData;
    isFormValid = false;
    etherUrl: string;
    personal: Personal;
    activities: any[] = [];
    orderid: string;
    orderData: any = '';
    id: string;
    currency: string;
    orderSub: Subscription;

    constructor(private canexService: CanexService, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        this.currency = 'CAN';
        this.orderSub = this.canexService.getOrder(this.route.snapshot.params.id).subscribe(activity => {
            this.orderData = activity;
            this.etherUrl = this.canexService.environment.etherscan + this.orderData.hash;
            this.currency = this.orderData.currency;
        },
            (error) => {
            });
    }

    ngOnDestroy() {
        if (this.orderSub) { this.orderSub.unsubscribe(); }
    }

    getOrder() {
        if (this.orderSub) { this.orderSub.unsubscribe(); }
        this.orderSub = this.canexService.getOrder(this.orderid).subscribe(activity => {
            this.orderData = activity;
            this.etherUrl = this.canexService.environment.etherscan + this.orderData.hash;
        },
            (error) => {
            });
    }

    cancel() {
        this.router.navigate(['./']);
    }

    submit() {
        this.title = 'TX successful';
        this.isFormValid = false;
        this.router.navigate(['./']);
    }
}
