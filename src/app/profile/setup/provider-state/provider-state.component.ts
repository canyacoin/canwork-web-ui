import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Headers, Http, RequestOptions, Response } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';

import { environment } from '../../../../environments/environment';
import { User, UserState, UserType } from '../../../core-classes/user';
import { EthService, Web3LoadingStatus } from '../../../core-services/eth.service';
import { UserService } from '../../../core-services/user.service';

@Component({
  selector: 'app-provider-state',
  templateUrl: './provider-state.component.html',
  styleUrls: ['./provider-state.component.css']
})
export class ProviderStateComponent implements OnInit, OnDestroy {

  @Input() currentUser: User;

  state: Web3LoadingStatus;
  account: string;

  loading = true;
  hasSubmittedTypeForm = false;
  hasBeenAccepted = false;
  hasBeenRejected = false;

  ethSub: Subscription;
  accSub: Subscription;

  constructor(private ethService: EthService, private http: Http, private userService: UserService) {
  }

  async ngOnInit() {
    this.ethSub = this.ethService.web3Status$.subscribe((state: Web3LoadingStatus) => {
      this.state = state;
      if (this.state !== Web3LoadingStatus.loading) {
        this.accSub = this.ethService.account$.subscribe(async (acc: string) => {
          this.loading = true;
          this.account = acc;
          this.updateFormSubmissionStatus(acc);
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.ethSub) { this.ethSub.unsubscribe(); }
    if (this.accSub) { this.accSub.unsubscribe(); }
  }

  async updateFormSubmissionStatus(acc: string) {
    if (acc) {
      const headers = new Headers();
      headers.append('authorization', 'bearer ' + environment.typeFormApiKey);
      const options = new RequestOptions({ headers: headers });
      const typeFormEntriesResponse = await this.http.get('https://api.typeform.com/forms/r2Bfb0/responses?query=' + acc, options).toPromise();
      const responseBody = typeFormEntriesResponse.text();

      this.hasSubmittedTypeForm = JSON.parse(responseBody)['total_items'] > 0;

      if (this.hasSubmittedTypeForm) {
        this.hasBeenAccepted = await this.ethService.providerHasBeenAccepted(acc);
        if (!this.hasBeenAccepted) {
          this.hasBeenRejected = await this.ethService.providerHasBeenRejected(acc);
          this.loading = false;
        } else {
          this.userService.updateUserProperty(this.currentUser, 'ethAddress', acc);
          this.loading = false;
        }
      } else { this.loading = false; }
    } else {
      this.hasSubmittedTypeForm = false;
      this.loading = false;
    }
  }

  finishProviderSetup() {
    this.userService.updateUserProperty(this.currentUser, 'whitelisted', true);
  }
}
