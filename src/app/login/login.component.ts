import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';

import { FirebaseUISignInSuccess } from 'firebaseui-angular';

import { UserService } from '../user.service';
import { AnimationsService } from '../animations.service';
// import { FeedService } from '../feed.service';
// import { EthService } from '../eth.service';

declare let require: any;

const Web3 = require('web3');
const daoAbi = require('../daoABI.json');
const daoContractAddress = '0x17b4ae55a5b0b6c10b0f4bae2d75a4e83de41709';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  feed = null;
  loading = false;
  state = 'loading';
  balance = 0;
  web3 = null;
  contract = null;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private animationsService: AnimationsService,
    // private feedService: FeedService,
    // private ethService: EthService,
    private afs: AngularFirestore) {

  }

  ngOnInit() {
    // this.feedService.getItems().subscribe((result: any) => {
    //   result.subscribe((data) => {
    //     console.log('feedService', data);
    //     this.feed = data[0];
    //   });
    // });
    // this.web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/Pjuqwe1f8zc0UUwAkZRJ '));
    // this.contract = new this.web3.eth.Contract(daoAbi, daoContractAddress);
    // this.loading = true;

    (<any>window).$((<any>window).document).on('click', '.firebaseui-idp-button', () => {
      this.loading = true;
      console.log('onAction', this.loading);
    });
  }

  ngAfterViewInit() {
    console.log('-- ngAfterViewInit --');

    this.animationsService.loadAnimations();
      // this.ethService.initWeb3();
      // this.ethService.web3InitObservable.subscribe( (state) => {

      //   console.log('LoginComponent - state', this.state);

      //   if ( !state.isMetaMaskAvailable ) {
      //     this.loading = false;
      //     this.state = 'metaMaskNotAvailable';
      //   } else if ( state.isMetaMaskAvailable && state.netId !== 1 ) {
      //     this.loading = false;
      //     this.state = 'switchToMainNet';
      //   } else if ( state.isMetaMaskAvailable && state.netId === 1 && !state.isWalletUnlocked ) {
      //     this.loading = false;
      //     this.state = 'walletLocked';
      //   } else {
      //     console.log('LoginComponent - state', this.state, this.ethService.account);
      //     if (this.ethService.account) {
      //       // DAO
      //       this.contract.methods.isAdmin( this.ethService.account ).call().then( (isAdmin) => {
      //         this.loading = false;
      //         console.log('isAdmin - flag', isAdmin);
      //         if (isAdmin) {
      //           this.state = 'loginAdmin';
      //         } else {
      //           this.contract.methods.isProvider( this.ethService.account ).call().then( (isProvider) => {
      //             console.log('isProvider - flag', isProvider);
      //             if (isProvider) {
      //               // this.state = 'loginProvider';
      //               this.ethService.getBalanceBN().then( (balance: any) => {
      //                 const minCAN = this.ethService.web3.utils.toBN( this.ethService.web3.utils.toWei('100', 'mwei') );
      //                 // console.log('getBalanceBN', balance.toString(10), minimum.toString(10));
      //                 if ( balance.gte(minCAN) ) {
      //                   this.state = 'loginProvider';
      //                 } else {
      //                   this.state = 'buyCAN';
      //                 }
      //               });

      //             } else {
      //               // this.state = 'searchingPioneers';

      //               // this.state = 'invitationOnly';

      //               this.ethService.getBalanceBN().then( (balance: any) => {
      //                 const minCAN = this.ethService.web3.utils.toBN( this.ethService.web3.utils.toWei('100', 'mwei') );
      //                 // console.log('getBalanceBN', balance.toString(10), minimum.toString(10));
      //                 if ( balance.gte(minCAN) ) {
      //                   this.state = 'loginUser';
      //                 } else {
      //                   this.state = 'buyCAN';
      //                 }
      //               });
      //             }
      //           }).catch( ( err ) => {
      //             console.log('isProvider - error', err);
      //             this.loading = false;
      //             this.state = 'contractError';
      //           });
      //         }
      //       }).catch( ( error ) => {
      //         console.log('isAdmin - error', error);
      //         this.loading = false;
      //         this.state = 'contractError';
      //       });

      //       // this.afs.collection<any>('whitelist').doc( this.ethService.account ).valueChanges().subscribe( (data: any) => {
      //       //   this.loading = false;
      //       //   if ( data && data.isWhitelisted ) {
      //       //     // this.ethService.getBalance().then( (balance: any) => {
      //       //     //   this.balance = balance;
      //       //     //   console.log('LoginComponent - balance',  this.balance);
      //       //     //   if ( this.balance > 99 ) {
      //       //     //     this.state = 'login';
      //       //     //   } else {
      //       //     //     this.state = 'buyCAN';
      //       //     //   }
      //       //     // });
      //       //     this.state = 'login';

      //       //   } else {
      //       //     this.state = 'searchingPioneers';
      //       //   }
      //       // });
      //     } else {
      //       this.state = 'contractError';
      //       this.loading = false;
      //     }
      //   }
      // });

  }

  async saveDetailsAndRedirect(credentials: any) {
    this.currentUser = credentials;

    // let badge = await this.contract.methods.getProviderBadge( this.ethService.account ).call();
    // console.log('saveDetailsAndRedirect - getProviderBadge', badge);

    // if (this.state === 'loginAdmin') {
    //   badge = 'Admin';
    // } else if (this.state === 'loginUser') {
    //   badge = 'User';
    // }

    setTimeout(() => {
      // this.userService.saveData('badge', badge);
      if (this.currentUser && this.currentUser.address) {
        this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().take(1).subscribe((user: any) => {
          console.log('saveDetailsAndRedirect - user', user);
          this.router.navigate(['/home']);
          this.loading = false;
        });
      }
    }, 800);
  }

  onConnect() {
    try {
      this.loading = true;
      // const type = this.state === 'loginProvider' ? 'Provider' : 'User';

      // if (type === 'Provider') {
      //   this.contract.methods.indexOfProvider( this.ethService.account ).call().then( (index) => {
      //     console.log('indexOfProvider', index);
      //   });
      // }

      // type
      this.userService.connect().then( (credentials) => {
        this.saveDetailsAndRedirect(credentials);
      }, (err) => {
        this.loading = false;
        console.log('onConnect - err', err);
      });
    } catch (error) {
      this.loading = false;
      console.log('onConnect - error', error);
    }
  }

  onLogin(signInSuccessData: FirebaseUISignInSuccess) {
    try {
      console.log('onLogin - signInSuccessData', signInSuccessData);
      (<any>window).$('#alternativeLoginModal').modal('hide');
      // const type = this.state === 'loginProvider' ? 'Provider' : 'User';
      const rnd = Math.floor(Math.random() * 109) + 1;
      const tmpCredentials = {
        '@context': 'http://schema.org',
        '@type': 'Person',
        'name': signInSuccessData['currentUser']['displayName'] || 'Empty',
        'address': signInSuccessData['currentUser']['uid'],
        'avatar': {
          'uri': signInSuccessData['currentUser']['photoURL'] || `assets/img/animals/${rnd}.png`
        },
        'email': signInSuccessData['currentUser']['email'] || 'Empty',
        'phone': signInSuccessData['currentUser']['phoneNumber'] || 'Empty'
      };
      const options = !signInSuccessData['credential'] && signInSuccessData['currentUser']['phoneNumber'] ?
        { field: 'phone', value: tmpCredentials['phone']} : { field: 'email', value: tmpCredentials['email']};

      this.afs.collection<any>('users', ref => ref.where(options.field, '==', options.value).limit(1)).valueChanges().take(1).subscribe( (data: any) => {
        // console.log('onLogin - exists', data);
        if (data && (data instanceof Array) && data.length > 0) {
          // console.log('onLogin - data', data[0]);
          localStorage.setItem('credentials', JSON.stringify(data[0]));
          this.saveDetailsAndRedirect( data[0] );
        } else {
          // , type
          this.userService.saveCredentials(tmpCredentials).then( (credentials) => {
            this.saveDetailsAndRedirect(credentials);
          }, (err) => {
            console.log('onLogin - err', err);
          });
        }
      });

    } catch (error) {
      console.log('onLogin - error', error);
    }
  }
}
