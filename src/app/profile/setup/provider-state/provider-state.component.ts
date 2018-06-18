import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../../environments/environment';
import { User, UserState, UserType } from '../../../core-classes/user';
import { EthService, Web3LoadingStatus } from '../../../core-services/eth.service';

@Component({
  selector: 'app-provider-state',
  templateUrl: './provider-state.component.html',
  styleUrls: ['./provider-state.component.css']
})
export class ProviderStateComponent implements OnInit, OnDestroy {

  @Input() currentUser: User;

  state: Web3LoadingStatus;
  account: string;
  hasSubmittedTypeForm = false;

  ethSub: Subscription;
  accSub: Subscription;

  constructor(private ethService: EthService, private http: Http) {
  }

  async ngOnInit() {
    this.ethService.web3Status$.subscribe((state: Web3LoadingStatus) => {
      this.state = state;
    });
    this.ethService.account$.subscribe(async (acc: string) => {
      this.account = acc;
      this.updateFormSubmissionStatus();
    });
  }

  ngOnDestroy() {
    if (this.ethSub) { this.ethSub.unsubscribe(); }
    if (this.accSub) { this.accSub.unsubscribe(); }
  }

  async updateFormSubmissionStatus() {
    if (this.account) {
      const headers = new Headers();
      headers.append('authorization', 'bearer ' + environment.typeFormApiKey);
      const options = new RequestOptions({ headers: headers });
      const typeFormEntriesResponse = await this.http.get('https://api.typeform.com/forms/r2Bfb0/responses?query=' + this.account, options).toPromise();
      const responseBody = typeFormEntriesResponse.text();
      console.log(responseBody);
      this.hasSubmittedTypeForm = JSON.parse(responseBody)['total_items'] > 0;
      console.log(this.hasSubmittedTypeForm);
    } else {
      this.hasSubmittedTypeForm = false;
    }
  }
}
