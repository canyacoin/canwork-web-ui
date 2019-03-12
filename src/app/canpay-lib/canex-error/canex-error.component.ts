import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

import { FormData, FormDataService, Personal } from '../services/formData.service';

@Component({
    selector: 'canyalib-canex-error',
    templateUrl: './canex-error.component.html',
    styleUrls: ['../canex-payment-options/canex-payment-options.component.css']
})

export class CanexErrorComponent implements OnInit {
    title = 'Enter details.';
    personal: Personal;
    form: any;
    @Input() formData: FormData;
    message: string;
    @Output() valueChange = new EventEmitter();

    constructor(private router: Router, private formDataService: FormDataService) {
    }

    ngOnInit() {
        this.personal = this.formDataService.getPersonal();
        this.formData = this.formDataService.getFormData();
        this.personal.currency = null;
    }

    cancel() {
        this.formData.email = '';
        // this.valueChange.emit(Step.none);
    }

}
