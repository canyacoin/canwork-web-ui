import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { EthService } from '../eth.service';

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.css']
})
export class BuyComponent implements OnInit, AfterViewInit {

  currentUser: any = JSON.parse( localStorage.getItem('credentials') );

  state = 'loading';
  balance = '0';

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private ethService: EthService) {

    console.log('ethService - buy constructor', this.ethService);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.activatedRoute.url.subscribe( (url) => {
      this.ethService.initWeb3();
      this.ethService.web3InitObservable.subscribe( (state) => {
        // if (!state.isRopstenNetAvailable ) {
        //   this.state = 'web3NotAvailable';
        // } else if (state.isRopstenNetAvailable && !state.isWalletUnlocked ) {
        //   this.state = 'walletLocked';
        // } else {
        //   this.state = 'buyCAN';

        //   this.ethService.getBalance().then( (data: any) => {
        //     this.balance = data;
        //     console.log('BuyComponent - balance',  this.balance);
        //   });
        // }
        // console.log('BuyComponent - state', this.state);

        if ( !state.isMetaMaskAvailable ) {
          this.state = 'metaMaskNotAvailable';
        } else if ( state.isMetaMaskAvailable && state.netId !== 1 ) {
          this.state = 'switchToMainNet';
        } else if ( state.isMetaMaskAvailable && state.netId === 1 && !state.isWalletUnlocked ) {
          this.state = 'walletLocked';
        } else {
          this.state = 'buyCAN';

          this.ethService.getBalance().then( (data: any) => {
            this.balance = data;
            console.log('BuyComponent - balance',  this.balance);
          });
        }

      } );
    });
  }

  onBuyNow() {
    (<any>window).$('#confirmTransaction').modal();
  }

  onConfirmTransaction() {
    this.ethService.buyCAN();
  }
}
