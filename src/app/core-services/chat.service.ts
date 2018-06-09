import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';

import * as moment from 'moment';
import { Avatar, User } from '../core-classes/user';

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
  checkout = 'CHECKOUT'
}

@Injectable()
export class ChatService {

  constructor(private afs: AngularFirestore) { }

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

  async saveChannelAsync(channelOwner: string, channel: Channel): Promise<boolean> {
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

  sendNewPostMessages(channelId: string, sender: User, receiver: User, description: string, budget: string) {
    const message = this.createMessageObject(channelId, sender, 'I\'ve just sent you a request, is this something you can do?');
    this.sendMessage(sender, receiver, message);

    const request = this.createMessageObject(channelId, sender, description, MessageType.request, budget);
    this.sendMessage(sender, receiver, request);
  }


  sendMessage(sender: User, receiver: User, message: Message) {
    try {
      // Save messages
      this.afs.collection('chats').doc(sender.address).collection('channels').doc(message.channel).collection('messages').add(Object.assign({}, message));
      this.afs.collection('chats').doc(receiver.address).collection('channels').doc(message.channel).collection('messages').add(Object.assign({}, message));

      // Update the channel
      this.afs.collection('chats').doc(sender.address).collection('channels').doc(message.channel).update({ message: message.message, timestamp: moment().format('x'), unreadMessages: false });
      this.afs.collection('chats').doc(receiver.address).collection('channels').doc(message.channel).update({ message: message.message, timestamp: moment().format('x'), unreadMessages: true });
    } catch (error) {
      console.error('sendMessage - error', error);
    }
  }

  createChannelObject(channelId: string, user: User, unreadMessages: boolean = true): Channel {
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

  createMessageObject(channelId: string, user: User, message: string, type: MessageType = MessageType.message, budget: string = '', price: string = ''): Message {
    return new Message({
      channel: channelId,
      address: user.address,
      avatar: user.avatar,
      budget: budget,
      name: user.name,
      title: user.title,
      message: message,
      type: type,
      timestamp: moment().format('x')
    });
  }
}
