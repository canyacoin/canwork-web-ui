import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';

import * as moment from 'moment';
import { Job } from '../core-classes/job';
import { ActionType, IJobAction } from '../core-classes/job-action';
import { Avatar, User, UserType } from '../core-classes/user';
import { AuthService } from './auth.service';

export class Channel {
  channel: string;
  address: string;
  avatar: Avatar;
  name: string;
  title: string;
  message: string;
  unreadMessages: boolean;
  timestamp: string;

  constructor(init?: Partial<Channel>) {
    Object.assign(this, init);
  }
}

export class Message {
  channel: string;
  address: string;
  avatar: Avatar;
  budget: string;
  name: string;
  title: string;
  jobId: string;
  message: string;
  type: MessageType;
  price: string;
  timestamp: string;

  constructor(init?: Partial<Message>) {
    Object.assign(this, init);
  }
}

export enum MessageType {
  message = 'MESSAGE',
  request = 'REQUEST',
  offer = 'OFFER',
  jobAction = 'ACTION',
  checkout = 'CHECKOUT'
}

@Injectable()
export class ChatService {

  constructor(private afs: AngularFirestore, private auth: AuthService, private router: Router) { }

  async createChannelsAsync(sender: User, receiver: User): Promise<string> {
    const channelId: string = [sender.address, receiver.address].sort().join('-');
    const senderChannel = this.createChannelObject(channelId, receiver, false);
    const receiverChannel = this.createChannelObject(channelId, sender);
    const senderChannelCreated = await this.saveChannelAsync(sender.address, senderChannel);
    const receiverChannelCreated = await this.saveChannelAsync(receiver.address, receiverChannel);
    return new Promise<string>((resolve, reject) => {
      if (senderChannelCreated && receiverChannelCreated) {
        resolve(channelId);
      }
      resolve(null);
    });
  }

  private async saveChannelAsync(channelOwner: string, channel: Channel): Promise<boolean> {
    const ref = this.afs.collection('chats').doc(channelOwner).collection('channels').doc(`${channel.channel}`);
    return new Promise<boolean>((resolve, reject) => {
      ref.snapshotChanges().take(1).toPromise().then((snap: any) => {
        if (!snap.payload.exists) {
          ref.set(Object.assign({}, channel));
        }
        resolve(true);
      }).catch(e => {
        resolve(false);
      });
    });
  }

  // Check if channel exists
  async createNewChannel(sender: User, receiver: User) {
    const channelId: string = [sender.address, receiver.address].sort().join('-');
    const path = `chats/${sender.address}/channels/${channelId}`;
    this.afs.firestore.doc(path).get().then(docSnapshot => {
      if (docSnapshot.exists) {
        // if the channel exists, navigate the user to the chat page.
        this.router.navigate(['inbox/chat', receiver.address]);
      } else {
        this.createAndNavigateToChannel(sender, receiver);
      }
    });
  }

  // create a channel without any message and navigate the user to it
  async createAndNavigateToChannel(sender: User, receiver: User) {
    const channelsCreated = await this.createChannelsAsync(sender, receiver);
    if (channelsCreated) {
      this.router.navigate(['inbox/chat', receiver.address]);
    } else {
      console.log('something wrong with the channels?');
    }
  }

  async sendJobMessages(job: Job, action: IJobAction) {
    const channelId: string = [job.clientId, job.providerId].sort().join('-');
    const sender = await this.auth.getCurrentUser();
    const receiverId = action.executedBy === UserType.client ? job.providerId : job.clientId;
    let messageText = '';
    switch (action.type) {
      // TODO: Finish these sentences - Dion
      case ActionType.createJob:
        messageText = 'I\'ve just sent you a job request, is this something you can do?';
        break;
      case ActionType.cancelJob:
        messageText = 'I\'ve just cancelled a job.. sorry about that!';
        break;
      case ActionType.declineTerms:
        messageText = 'I do not agree with the proposed terms and have declined the job offer.';
        break;
      case ActionType.counterOffer:
        messageText = 'I have proposed a counter offer!';
        break;
      case ActionType.acceptTerms:
        messageText = 'I have accepted the terms of the job';
        break;
      case ActionType.enterEscrow:
        messageText = 'I have deposited funds into the escrow system!';
        break;
      default:
        messageText = 'I\'ve made a change to our job, can you have a look?';
        break;
    }
    const message = this.createMessageObject(channelId, sender, messageText, MessageType.jobAction, null, null, job.id);
    this.sendMessage(sender.address, receiverId, message);
  }

  // sendNewPostMessages(channelId: string, sender: User, receiver: User, description: string, budget: string) {
  //   const message = this.createMessageObject(channelId, sender, 'I\'ve just sent you a request, is this something you can do?');
  //   this.sendMessage(sender, receiver, message);

  //   const request = this.createMessageObject(channelId, sender, description, MessageType.request, budget);
  //   this.sendMessage(sender, receiver, request);
  // }

  sendMessage(senderId: string, receiverId: string, message: Message) {
    try {
      // Save messages
      this.afs.collection('chats').doc(senderId).collection('channels').doc(message.channel).collection('messages').add(Object.assign({}, message));
      this.afs.collection('chats').doc(receiverId).collection('channels').doc(message.channel).collection('messages').add(Object.assign({}, message));

      // Update the channel
      this.afs.collection('chats').doc(senderId).collection('channels').doc(message.channel).update({ message: message.message, timestamp: moment().format('x'), unreadMessages: false });
      this.afs.collection('chats').doc(receiverId).collection('channels').doc(message.channel).update({ message: message.message, timestamp: moment().format('x'), unreadMessages: true });
    } catch (error) {
      console.error('sendMessage - error', error);
    }
  }

  private createChannelObject(channelId: string, user: User, unreadMessages: boolean = true): Channel {
    return new Channel({
      channel: channelId,
      address: user.address,
      avatar: user.avatar,
      name: user.name,
      title: user.title,
      message: '',
      unreadMessages: unreadMessages,
      timestamp: moment().format('x')
    });
  }

  createMessageObject(channelId: string, user: User, message: string, type: MessageType = MessageType.message, budget: string = '', price: string = '', jobId: string = ''): Message {
    return new Message({
      channel: channelId,
      address: user.address,
      avatar: user.avatar,
      budget: budget,
      name: user.name,
      title: user.title,
      jobId: jobId,
      message: message,
      type: type,
      timestamp: moment().format('x')
    });
  }
}
