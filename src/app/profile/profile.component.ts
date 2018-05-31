import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { UserService } from '../user.service';
import { EthService } from '../eth.service';
import { FeedService } from '../feed.service';

import * as isEmpty from 'lodash/isEmpty';
import * as orderBy from 'lodash/orderBy';
// import * as moment from 'moment';
import * as moment from 'moment-timezone';

declare let escape: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  selectedTab = 'WORK';
  // userModel: Observable<any> = null;
  userModel: any = null;
  workModel: any = null;
  allWorkModel: any = null;
  commentsModel: any = null;
  reactionsModel: any = null;
  comment = '';
  error = '';
  bannerUser: any = [];
  feed: any = [];
  whoViewProfileCounter = 0;
  state = 'loading';

  placeholder = 'assets/img/work-placeholder.svg';
  cover = 'assets/img/work-placeholder.jpg';
  height: number = (<any>window).$(window).height();
  maxHeight = 775;

  pageLimit = 2;
  currentPage = 0;
  lastPage = 0;
  resultLength = 0;

  animation = 'fadeIn';

  private portfolioSubscription: Subscription;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private ethService: EthService,
    private feedService: FeedService,
    private afs: AngularFirestore) {

    // this.usersCollectionRef = this.afs.collection<any>('users');
    // this.users$ = this.usersCollectionRef.valueChanges();

    this.userService.getCurrentUser().subscribe((user: any) => {
      this.currentUser = user;
      if (this.currentUser && !(this.currentUser.colors instanceof Array)) {
        this.currentUser.colors = ['#00FFCC', '#33ccff', '#15EDD8'];
      }
    });
  }

  ngOnInit() {
    // (<any>window).$('[data-toggle="tooltip"]').tooltip();
    this.getBannerUser();

    // Feed
    this.feedService.getItems().subscribe((result: any) => {
      result.subscribe((data) => {
        data.slice(0, 3).map((item) => {
          this.feed.push(item);
        });
      });
    });
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['address']) {
        this.loadUser(params['address']);
      } else {
        if (this.currentUser && this.currentUser.address) {
          this.loadUser(this.currentUser.address);
        }
      }
      this.getWeb3State();
    });
  }

  checkUserState() {
    if (this.currentUser && this.currentUser.address) {
      this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().subscribe((user: any) => {
        console.log('ngAfterViewInit - user', user);
        if (user.state !== 'Done') {
          this.router.navigate(['/profile/edit']);
        }
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
      }
    });
  }

  loadUser(address: string) {

    try {
      this.afs.doc(`users/${address}`).valueChanges().take(1).subscribe((data: any) => {
        // if (data && !data.avatar) {
        //   data['avatar'] = { uri: 'assets/img/placeholder.png' };
        // }
        this.userModel = data;
        if (this.userModel && !(this.userModel.colors instanceof Array)) {
          this.userModel.colors = ['#00FFCC', '#33ccff', '#15EDD8'];
        }
        if (this.userModel && this.userModel.timezone) {
          this.userModel.offset = moment.tz(this.userModel.timezone).format('Z');
        }
        this.saveWhoViewProfile();

        console.log('** loadUser - userModel **', this.userModel);

        this.activatedRoute.url.take(1).subscribe((url) => {
          this.currentUser = JSON.parse(localStorage.getItem('credentials'));
          console.log('activatedRoute - change', this.currentUser, url);
          if (this.currentUser && (this.currentUser.address === this.userModel.address)) {
            this.checkUserState();
          }
        });

        console.log('loadUser - subscribe', data, this.userModel.address);
        this.setReactions(address);
      });

      // Portfolio
      const portfolioRecords = this.afs.collection(`portfolio/${address}/work`, ref =>
        ref.orderBy('timestamp', 'desc'));
      this.portfolioSubscription = portfolioRecords.valueChanges().subscribe((data: any) => {
        this.resultLength = data.length;
        this.lastPage = (Math.ceil(this.resultLength / this.pageLimit) - 1)
        this.allWorkModel = data;
        this.workModel = this.portfolioWorkDataRecords();
        console.log(`works (${this.workModel.length})`, this.workModel);
        this.loadPortfolioAnimation();
      });

      // Comments
      this.afs.collection(`comments/${address}/messages`).valueChanges().subscribe((data: any) => {
        let tmpComments = [];
        data.map((item) => {
          item['humanisedDate'] = moment(item.timestamp, 'x').fromNow();
        });
        tmpComments = orderBy(data, ['timestamp'], ['desc']);
        this.commentsModel = tmpComments;
        console.log('comments', this.commentsModel);
      });

    } catch (error) {
      console.error('loadUser - error', error);
    }
  }

  getBannerUser() {
    this.afs.collection('users', ref => ref.where('state', '==', 'Done').where('type', '==', 'Provider').orderBy('timestamp', 'desc').limit(1)).valueChanges().take(1).subscribe((data: any) => {
      this.bannerUser = data;
    });
  }

  getWhoViewProfileCounter() {
    if (this.currentUser && this.userModel && (this.currentUser.address === this.userModel.address)) {
      const ref = this.afs.collection(`who/${this.currentUser.address}/user`);
      ref.valueChanges().take(1).toPromise().then((data: any) => {
        console.log('getWhoViewProfileCounter', data.length);
        this.whoViewProfileCounter = data.length;
      });
    }
  }

  saveWhoViewProfile() {
    this.getWhoViewProfileCounter();
    if (this.currentUser && this.userModel && (this.currentUser.address !== this.userModel.address)) {
      const ref = this.afs.doc(`who/${this.userModel.address}/user/${this.currentUser.address}`);
      ref.snapshotChanges().take(1).toPromise().then((snap: any) => {
        console.log('saveWhoViewProfile - user', this.currentUser, 'view profile:', this.userModel);
        const tmpModel = this.currentUser;
        tmpModel['timestamp'] = moment().format('x');
        return snap.payload.exists ? ref.update(this.currentUser) : ref.set(tmpModel);
      });
    }
  }

  setReactions(address: string) {
    // Reactions
    this.afs.collection('reactions').doc(address).snapshotChanges().subscribe((snap: any) => {
      console.log('setReactions - payload', snap.payload.exists);
      if (!snap.payload.exists) {
        const name: string = this.userModel.name.substr(0, this.userModel.name.indexOf(' '));
        const reactions = [
          {
            address: address,
            id: 'service',
            question: `What do you love about ${name}\'s service?`,
            total: 0,
            answers: [
              { answer: 'Unique', value: 0, active: localStorage.getItem(`${address}Unique`) },
              { answer: 'Great quality', value: 0, active: localStorage.getItem(`${address}Great quality`) },
              { answer: 'Solid value', value: 0, active: localStorage.getItem(`${address}Solid value`) },
              { answer: 'It\'s not for me', value: 0, active: localStorage.getItem(`${address}It\'s not for me`) },
            ]
          },
          {
            address: address,
            id: 'provider',
            question: `${name} is...`,
            total: 0,
            answers: [
              { answer: 'Versatile', value: 0, active: localStorage.getItem(`${address}Versatile`) },
              { answer: 'Creative', value: 0, active: localStorage.getItem(`${address}Creative`) },
              { answer: 'Knowledgeable', value: 0, active: localStorage.getItem(`${address}Knowledgeable`) },
              { answer: 'Not sure', value: 0, active: localStorage.getItem(`${address}Not sure`) }
            ]
          },
          {
            address: address,
            id: 'recommended',
            question: 'Will you continue to use this service?',
            total: 0,
            answers: [
              { answer: 'Yes, I will continue to use.', value: 0, active: localStorage.getItem(`${address}Yes, I will continue to use.`) },
              { answer: 'No, thanks.', value: 0, active: localStorage.getItem(`${address}No, thanks.`) },
            ]
          }
        ];
        this.reactionsModel = reactions;
      } else {
        this.reactionsModel = snap.payload.doc.data();
      }
      console.log('reactions', this.reactionsModel);
    });
  }

  setChannel(address: string, channel: string, model: any) {
    const ref = this.afs.collection('chats').doc(address).collection('channels').doc(`${channel}`);
    ref.snapshotChanges().take(1).toPromise().then((snap: any) => {
      console.log('setChannel - payload', address, model, snap.payload.exists);
      return snap.payload.exists ? {} : ref.set(model);
      // ref.update( model )
    });
  }

  loadPortfolioAnimation() {
    setTimeout(() => {
      // console.log('portfolio', document.getElementById('portfolio') );
      if (document.getElementById('portfolio')) {
        const portfolioData = {
          wrapper: document.getElementById('portfolio'),
          animType: 'html',
          loop: true,
          prerender: true,
          autoplay: true,
          path: 'assets/data/hand.json',
          rendererSettings: {
            progressiveLoad: false
          }
        };
        const portfolioAnim = (<any>window).bodymovin.loadAnimation(portfolioData);
        portfolioAnim.setSpeed(0.75);

        // console.log('portfolio', (<any>window).bodymovin, portfolioData, portfolioAnim);
      }
    }, 400);
  }

  onTab(tab: string) {
    this.selectedTab = tab;
    return true;
  }

  onComment(txt: any) {
    if (isEmpty(this.comment.trim())) {
      this.error = 'Comments can\'t be blank.';
      return;
    } else {
      this.error = '';
    }
    const address: string = this.currentUser.address;
    const commentModel: any = {
      address: address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name.substr(0, this.currentUser.name.indexOf(' ')),
      post: this.comment,
      timestamp: moment().format('x')
    };
    // this.afDb.list(`comments/${uid}`).push( commentModel );
    this.afs.collection('comments').doc(address).collection('messages').add(commentModel);
    this.comment = '';
    txt.focus();
  }

  onReaction(event: any) {

    // this.reactions[index]['answers'][rIndex]['value']++;

    // this.action.emit( { reaction: this.reactions[index], response: this.reactions[index]['answers'][rIndex] } );



    // this.afDb.object(`reactions/${ this.currentUser.address }/${this.reactions[index].address}/${}`).query.ref.transaction( (val) => {
    //   return !val ? 1 : val + 1;
    // });
  }

  onCanya() {
    try {
      this.router.navigate(['/post', this.userModel.address]);
    } catch (error) {
      console.error('onCanya - error', error);
    }
  }

  async onBuyACoffee() {
    await this.ethService.buyCOFFEE(this.userModel.ethAddress, 1);
    (<any>window).$('#thankYou').modal();
  }

  onBuy() {
    this.router.navigate(['buy']);
    window.location.reload();
  }

  onSetUpYourWallet() {
    console.log('onSetUpYourWallet', this.ethService.account);

    if (this.state === 'web3NotAvailable') {
      (<any>window).$('#web3NotAvailable').modal();
    } else if (this.state === 'switchToMainNetModal') {
      (<any>window).$('#switchToMainNetModal').modal();
    } else if (this.state === 'walletLocked') {
      (<any>window).$('#walletLocked').modal();
    } else {
      if (this.ethService.account) {
        (<any>window).$('#thankYou').modal();
        this.currentUser['ethAddress'] = this.ethService.account;
        this.userModel['ethAddress'] = this.ethService.account;
        this.userService.saveData('ethAddress', this.ethService.account);
      } else {
        alert('Error: MetaMask could not be loaded!');
      }
    }
  }

  onShare() {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + escape(window.location.href) + '&t=' + document.title, '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

  onTweet() {
    window.open('https://twitter.com/intent/tweet?url=' + escape(window.location.href) + '&text=' + document.title + '&original_referer=' + escape('https://canya.com'), '',
      'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    return false;
  }

  onBack() {
    if ((<any>window).$('html, body')) {
      (<any>window).$('html, body').animate({ scrollTop: 0 }, 600);
    }
    if ((<any>window).history.length > 0) {
      (<any>window).history.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  ngOnDestroy() {
    console.log('+ destroyer of worlds', null)
    this.portfolioSubscription.unsubscribe();
  }

  public portfolioWorkDataRecords() {
    return this.allWorkModel.slice((this.currentPage * this.pageLimit), ((this.currentPage * this.pageLimit) + this.pageLimit));
  }

  public nextPage() {
    this.fadeOutAndIn();
    this.currentPage++;
  }

  public previousPage() {
    this.fadeOutAndIn();
    this.currentPage--;
  }

  private async fadeOutAndIn() {
    this.animation = 'fadeOut';
    setTimeout(() => { this.animation = 'fadeIn'; }, 400);
  }

}
