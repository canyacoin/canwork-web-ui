import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';

import { UserService } from '../user.service';

import * as moment from 'moment';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, AfterViewInit {

  currentUser: any = JSON.parse(localStorage.getItem('credentials'));

  // Forms
  postForm: FormGroup = null;

  // Models
  fAddress = '';
  userModel: any = null;
  isSending = false;
  sent = false;
  channel = '';

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private afs: AngularFirestore) {


    this.postForm = formBuilder.group({
      description: ['', Validators.compose([Validators.required, Validators.maxLength(255)])],
      budget: ['', Validators.compose([Validators.required, Validators.min(10), Validators.maxLength(9999)])]
    });
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['address'] && params['address'] !== this.currentUser.address) {
        this.fAddress = params['address'];
        console.log('ngOnInit - fAddress', this.fAddress);
        this.loadUser(this.fAddress);
      }
    });
  }

  ngAfterViewInit() {
  }

  loadUser(address: string) {
    try {
      this.afs.doc(`users/${address}`).valueChanges().take(1).subscribe( (data: any) => {
        this.userModel = data;
        this.currentUser = JSON.parse( localStorage.getItem('credentials') );
        // this.activatedRoute.url.take(1).subscribe( (url) => {
        //   this.currentUser = JSON.parse( localStorage.getItem('credentials') );
        // });
        this.channel = [this.currentUser.address, this.userModel.address].sort().join('-');
      });

      this.afs.doc(`users/${this.currentUser.address}`).valueChanges().take(1).subscribe( (data: any) => {
        this.currentUser = data;
      });
    } catch (error) {
      console.error('loadUser - error', error);
    }
  }

  setChannel(address: string, channel: string, model: any) {
    const ref = this.afs.collection('chats').doc(address).collection('channels').doc(`${ channel }`);
    ref.snapshotChanges().take(1).toPromise().then( (snap: any) => {
      console.log('setChannel - payload', address, model, snap.payload.exists);
      return snap.payload.exists ?  {} : ref.set( model );
      // ref.update( model )
    });
  }

  createChannels() {
    try {
      console.log('createChannels - currentUser', this.currentUser);

      const currentUserChannel = {
        channel: this.channel,
        address: this.userModel.address,
        avatar: this.userModel.avatar,
        name: this.userModel.name,
        title: this.userModel.title,
        message: 'No messages',
        timestamp: moment().format('x')
      };
      console.log('createChannels - current', currentUserChannel);
      this.setChannel( this.currentUser.address, this.channel, currentUserChannel );

      /////////////////////////////////////////////////

      const userModelChannel = {
        channel: this.channel,
        address: this.currentUser.address,
        avatar: this.currentUser.avatar,
        name: this.currentUser.name,
        title: this.currentUser.title,
        message: 'No messages',
        timestamp: moment().format('x')
      };
      console.log('createChannels - userModel', userModelChannel);
      this.setChannel( this.userModel.address, this.channel, userModelChannel );

    } catch (error) {
      console.error('createChannels - error', error);
    }
  }

  sendMessage(messageModel: any) {
    try {
      console.log('sendMessage', this.currentUser.address, this.userModel.address, this.channel, messageModel);
      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').doc(this.channel).collection('messages').add(messageModel);
      this.afs.collection('chats').doc(this.userModel.address).collection('channels').doc(this.channel).collection('messages').add(messageModel);

      this.afs.collection('chats').doc(this.currentUser.address).collection('channels').doc(this.channel).update( { message: messageModel.message, timestamp: moment().format('x') } );
      this.afs.collection('chats').doc(this.userModel.address).collection('channels').doc(this.channel).update( { message: messageModel.message, timestamp: moment().format('x') } );
    } catch (error) {
      console.error('sendMessage - error', error);
    }
  }

  onPostRequest() {
    this.isSending = true;
    this.createChannels();

    const tmpMessage = {
      channel: this.channel,
      address: this.currentUser.address,
      avatar: this.currentUser.avatar,
      name: this.currentUser.name,
      title: this.currentUser.title,
      message: 'I\'ve sent you a request. Please, let me know if you CanYa do something, ok?',
      type: 'MESSAGE',
      timestamp: moment().format('x')
    };
    console.log('onPostRequest - tmpMessage', tmpMessage);
    this.sendMessage(tmpMessage);

    setTimeout( () => {
      const tmpRequest = {
        channel: this.channel,
        address: this.currentUser.address,
        avatar: this.currentUser.avatar,
        name: this.currentUser.name,
        title: this.currentUser.title,
        message: this.postForm.value.description,
        budget: this.postForm.value.budget,
        type: 'REQUEST',
        timestamp: moment().format('x')
      };
      console.log('onPostRequest - tmpRequest', tmpRequest);
      this.sendMessage(tmpRequest);
    }, 300 );

    this.isSending = false;
    this.sent = true;
  }

}
