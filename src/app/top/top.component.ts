import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';

import { UserService } from '../user.service';

import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-top',
  templateUrl: './top.component.html',
  styleUrls: ['./top.component.css']
})
export class TopComponent implements OnInit, OnDestroy {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));
  hasUnreadMessages = false;
  messagesSubscription: Subscription;

  

  @Output() searchKeyUp: EventEmitter<any> = new EventEmitter();
  @Output() searchFocus: EventEmitter<any> = new EventEmitter();
  @Output() searchBlur: EventEmitter<any> = new EventEmitter();

  constructor(private router: Router,
    private userService: UserService,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth) {
  }

  ngOnInit() {
    const unreadConversations = this.afs.collection('chats').doc(this.currentUser.address).collection('channels', ref => ref.where('unreadMessages', '==', true));
    console.log("got unread conversations");
    this.messagesSubscription = unreadConversations.valueChanges().subscribe(x => {
      console.log("hit the value changes"); 
      console.log(x.length); 
      this.hasUnreadMessages = x.length > 0;
    });
  }

  ngOnDestroy(){
    if(this.messagesSubscription){
      this.messagesSubscription.unsubscribe();
    }
  }

  closeMenu() {
    (<any>window).$('body').removeClass('topbar-reveal');
    (<any>window).$('.topbar-backdrop').remove();
  }

  onConnect() {
    try {
      this.userService.connect().then((credentials) => {
        this.currentUser = credentials;
        // this.router.navigate(['/home']);

        this.afs.collection<any>('users').doc(this.currentUser.address).valueChanges().subscribe((user: any) => {
          console.log('onConnect - user', user);
          if (user.state !== 'Done') {
            this.router.navigate(['/bot']);
          } else {
            this.router.navigate(['/home']);
          }
        });

        // const state = this.userService.db.get('state');
        // console.log('state', state);
        // if ( state === 'Done' ) {
        //   this.router.navigate(['/home']);
        // } else {
        //   this.router.navigate(['/bot']);
        // }
      });
    } catch (error) {
      console.error('onConnect - error', error);
    }
  }

  onKeyUp(event: any) {
    this.searchKeyUp.emit(event);
  }

  onFocus(event: any) {
    this.searchFocus.emit(event);
  }

  onBlur(event: any) {
    setTimeout(() => {
      this.searchBlur.emit(event);
    }, 50);
  }

  onSubmit(event: any) {
    if ((<any>window).$('html, body')) {
      (<any>window).$('html, body').animate({ scrollTop: -10 }, 600);
    }
    this.router.navigate(['search', event]);
  }

  onLogout() {
    localStorage.clear();
    this.afAuth.auth.signOut();
    this.router.navigate(['login']);
    window.location.reload();
  }

}
