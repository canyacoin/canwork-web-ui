import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../user.service';
import { EthService } from '../eth.service';

// import * as isEmpty from 'lodash/isEmpty';
// import * as orderBy from 'lodash/orderBy';
import * as moment from 'moment';
import * as findIndex from 'lodash/findIndex';
import * as orderBy from 'lodash/orderBy';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, AfterViewInit {

  // User
  currentUser: any = JSON.parse(localStorage.getItem('credentials'));
  fAddress = '';

  // Models
  userModel: any = null;
  message = '';
  channels: any = [];
  chats: any = [];
  selectedChannel: any;
  macros: any = [
    { type: 'MESSAGE', text: 'Hello' },
    { type: 'MESSAGE', text: 'Ok' },
    { type: 'MESSAGE', text: 'Not sure' },
    { type: 'MESSAGE', text: 'Maybe later' },
    { type: 'MESSAGE', text: 'Yes' },
    { type: 'MESSAGE', text: 'No' },
    { type: 'MESSAGE', text: 'Thank you' }
  ];
  modalData: any = { service: '', budget: 0 };
  queryChannels: any = [];
  tabIndex = 0;
  balance = '0';
  state = 'loading';

  // Forms
  postForm: FormGroup = null;
  offerForm: FormGroup = null;

  // Flags
  isSending = false;
  isLoading = true;
  hideBanner = false;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private ethService: EthService,
    private afs: AngularFirestore) {

    this.postForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      budget: ['', Validators.compose([Validators.required, Validators.min(10), Validators.maxLength(9999)])]
    });

    this.offerForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      price: ['', Validators.compose([Validators.required, Validators.min(10), Validators.maxLength(9999)])]
    });

    console.log('ethService - chat constructor', this.ethService);

    this.userService.getCurrentUser().subscribe((user: any) => {
      this.currentUser = user;
    });

    this.setSelectedChannel(JSON.parse(localStorage.getItem('selectedChannel')));
  }

  ngOnInit() {
    (<any>window).$('[data-toggle="popover"]').popover({
      container: 'body'
    });
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['address'] && params['address'] !== this.currentUser.address) {
        this.fAddress = params['address'];
        console.log('ngOnInit - fAddress', this.fAddress);
      }
      this.loadChannels();
    });

    this.activatedRoute.url.subscribe((url) => {
      this.getWeb3State();
    });
  }

  loadChannels() {
    try {
      console.log('loadChats', this.currentUser.address);
      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').valueChanges().subscribe((data: any) => {
        if (!this.selectedChannel) {
          if (this.fAddress !== '') {
            const idx = findIndex(data, { 'address': this.fAddress });
            if (idx !== '-1') {
              this.setSelectedChannel(data[idx]);
            }
          } else {
            this.setSelectedChannel(data[0]);
          }
        }
        this.channels = orderBy(data, ['timestamp'], ['desc']);
        this.onSearch('');
        console.log('loadChats', this.channels);
        this.loadChats();
        this.loadUser();
      });
    } catch (error) {
      console.error('loadUser - error', error);
    }
  }

  setSelectedChannel(channel: any){
    if(channel){
      this.selectedChannel = channel;
      this.readIfUnread();
    }
  }

  readIfUnread(){
    if(this.selectedChannel && this.selectedChannel.unreadMessages){
      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').doc(this.selectedChannel.channel).update({ unreadMessages: false });
    }
  }

  loadChats() {
    this.chats = [];
    if (this.selectedChannel) {
      const collection = this.afs.collection('chats').doc(this.currentUser.address).collection('channels')
        .doc(this.selectedChannel.channel)
        .collection('messages', ref => ref.limit(50).orderBy('timestamp', 'desc'))
        .valueChanges().map((array) => array.reverse());

      collection.subscribe((data: any) => {
        this.isLoading = false;
        this.chats = data;
        this.scrollToBottom();
      });
    }
  }

  loadUser() {
    if (this.selectedChannel) {
      console.log('loadUser - address', this.selectedChannel.address);
      this.afs.doc(`users/${this.selectedChannel.address}`).valueChanges().take(1).subscribe((data: any) => {
        this.userModel = data;
      });
    }
  }

  getWeb3State() {
    this.ethService.initWeb3();
    this.ethService.web3InitObservable.subscribe((state) => {
      if (!state.isMetaMaskAvailable) {
        this.state = 'web3NotAvailable';
      } else if (state.isMetaMaskAvailable && state.netId !== 1) {
        this.state = 'switchToMainNetModal';
      } else if (state.isMetaMaskAvailable && state.netId === 1 && !state.isWalletUnlocked) {
        this.state = 'walletLocked';
      } else {
        this.state = 'buyCAN';

        this.ethService.getBalance().then((data: any) => {
          this.balance = data;
          console.log('getWeb3State - balance', this.balance);
        });
      }
    });
  }


  scrollToBottom() {
    setTimeout(() => {
      // console.log('scrollToBottom', (<any>window).$('#section-messages-end'), (<any>window).$('#section-messages-end').offset() );
      if ((<any>window).$('#section-messages') && ((<any>window).$('#section-messages-end') && (<any>window).$('#section-messages-end').offset())) {
        (<any>window).$('#section-messages').animate({
          scrollTop: (<any>window).$('#section-messages-end').offset().top + (<any>window).$('#section-messages').scrollTop()
        }, 300);
      }
    }, 300);
  }

  sendMessage(messageModel: any) {
    try {
      console.log('sendMessage', this.currentUser.address, this.selectedChannel.address, this.selectedChannel.channel, messageModel);
      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').doc(this.selectedChannel.channel).collection('messages').add(messageModel);
      this.afs.collection('chats').doc(this.selectedChannel.address).collection('channels').doc(this.selectedChannel.channel).collection('messages').add(messageModel);

      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').doc(this.selectedChannel.channel).update({ message: messageModel.message, timestamp: moment().format('x'), unreadMessages: false });
      this.afs.collection('chats').doc(this.selectedChannel.address).collection('channels').doc(this.selectedChannel.channel).update({ message: messageModel.message, timestamp: moment().format('x'), unreadMessages: true });

      this.message = '';
      this.scrollToBottom();
    } catch (error) {
      console.error('sendMessage - error', error);
    }
  }

  postTransaction(checkoutModel: any, receipt: any) {
    // const tmpRequest = {
    //   channel: this.selectedChannel.channel,
    //   address: this.currentUser.address,
    //   avatar: this.currentUser.avatar,
    //   name: this.currentUser.name,
    //   title: this.currentUser.title,
    //   message: checkoutModel.message,
    //   budget: checkoutModel.budget,
    //   type: 'TRANSACTION',
    //   timestamp: moment().format('x')
    // };
    // this.sendMessage(tmpRequest);

    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: 'You\'ve received a payment. Please, check your MetaMask Wallet.',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };

    // const tmpMessage = {
    //   channel: this.selectedChannel.channel,
    //   address: checkoutModel.address,
    //   avatar: checkoutModel.avatar,
    //   name: checkoutModel.name,
    //   title: checkoutModel.title,
    //   message: 'You\'ve received a payment. Please, check your MetaMask Wallet.',
    //   type: 'MESSAGE',
    //   timestamp: moment().format('x')
    // };
    this.sendMessage(tmpMessage);
  }

  onSearch(query: string) {
    console.log('onSearch', query === '' ? 'Empty' : query);
    if (query !== '') {
      const tmpChannels: any = [];
      this.channels.map((item) => {
        if (JSON.stringify(item).toLowerCase().includes(query.toLowerCase())) {
          tmpChannels.push(item);
        }
      });
      this.queryChannels = tmpChannels;
    } else {
      console.log('onSearch - channels', this.channels);
      this.queryChannels = this.channels;
    }
  }

  onKeyUp(event: any) {
    console.log('onKeyUp', event);
    this.onSearch(event);
  }

  onSelect(channelModel: any) {
    this.setSelectedChannel(channelModel);
    localStorage.setItem('selectedChannel', JSON.stringify(this.selectedChannel));
    this.loadChats();
    this.loadUser();
  }

  // onBuyCAN(modalModel: any) {
  //   if (!this.ethService.isRopstenNetAvailable ) {
  //     (<any>window).$('#web3NotAvailable').modal();
  //   } else if (this.ethService.isRopstenNetAvailable && !this.ethService.isWalletUnlocked ) {
  //     (<any>window).$('#walletLocked').modal();
  //   } else {
  //     (<any>window).$('#buyCAN').modal();
  //   }
  // }

  onBuy() {
    this.router.navigate(['buy']);
    window.location.reload();
  }

  onBuyNow() {
    this.ethService.buyCAN();
  }

  onMacro(message: string) {
    this.message = message;
    this.onSend();
  }

  onSend() {

    console.log('onSend - currentUser', this.currentUser);

    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: this.message,
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpMessage);
  }

  onPostRequest() {

    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: 'I\'ve sent you a request. Please, let me know if you CanYa do something, ok?',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpMessage);

    const tmpRequest = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: this.postForm.value.description,
      budget: this.postForm.value.budget,
      type: 'REQUEST',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpRequest);
    (<any>window).$('#postARequest').modal('hide');
  }

  onMakeAnOffer() {

    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: 'I\'ve sent you an offer. Please, let me know what do you think. Thanks. 👌🏻',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpMessage);

    const tmpRequest = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: this.offerForm.value.description,
      price: this.offerForm.value.price,
      type: 'OFFER',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpRequest);
    (<any>window).$('#makeAnOffer').modal('hide');
  }

  onAccept(checkoutModel: any, type: string) {
    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: type === 'REQUEST' ? 'I accept your request. Let\'s do it! 👍🏻' : 'I accept your offer. Thanks! 👍🏻',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpMessage);

    const tmpRequest = {
      channel: this.selectedChannel.channel,
      address: type === 'REQUEST' ? this.currentUser.address : this.selectedChannel.address,
      avatar: type === 'REQUEST' ? this.currentUser.avatar : this.selectedChannel.avatar,
      name: type === 'REQUEST' ? this.currentUser.name : this.selectedChannel.name,
      title: type === 'REQUEST' ? this.currentUser.title : this.selectedChannel.title,
      message: checkoutModel.message,
      budget: type === 'REQUEST' ? checkoutModel.budget : checkoutModel.price,
      type: 'CHECKOUT',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpRequest);
  }

  onPayLater(checkoutModel: any) {
    const tmpMessage = {
      channel: this.selectedChannel.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: 'I\'ll pay later. Thanks.',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    this.sendMessage(tmpMessage);
  }

  onPayNow(checkoutModel: any) {

    console.log('onPayNow - checkoutModel', checkoutModel);

    this.modalData.service = checkoutModel.message;
    this.modalData.budget = checkoutModel.budget;
    // if (!this.ethService.isRopstenNetAvailable ) {
    //   (<any>window).$('#web3NotAvailable').modal();
    // } else if (this.ethService.isRopstenNetAvailable && !this.ethService.isWalletUnlocked ) {
    //   (<any>window).$('#walletLocked').modal();
    // } else {
    //   // (<any>window).$('#checkoutAndPay').modal();
    //   (<any>window).$('#confirmTransaction').modal();
    // }

    if (this.state === 'web3NotAvailable') {
      (<any>window).$('#web3NotAvailable').modal();
    } else if (this.state === 'switchToMainNetModal') {
      (<any>window).$('#switchToMainNetModal').modal();
    } else if (this.state === 'walletLocked') {
      (<any>window).$('#walletLocked').modal();
    } else {
      (<any>window).$('#confirmTransaction').modal();
    }
  }

  onPay() {
    this.ethService.payCAN(this.modalData.budget);
  }

  onConfirmTransaction() {
    this.ethService.payCAN(this.modalData.budget).subscribe((receipt) => {
      console.log('payCAN - receipt', receipt);
      this.postTransaction(null, receipt);
    });
  }
}
