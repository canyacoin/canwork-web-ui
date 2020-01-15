import { Injectable, ContentChildren } from '@angular/core'
import { Router } from '@angular/router'
import { AngularFirestore } from 'angularfire2/firestore'
import { take } from 'rxjs/operators'

import { Job } from '../core-classes/job'
import { ActionType, IJobAction } from '../core-classes/job-action'
import { Avatar, User, UserType } from '../core-classes/user'
import { AuthService } from './auth.service'

export class Channel {
  channel: string
  address: string
  avatar: Avatar
  name: string
  title: string
  message: string
  unreadMessages: boolean
  timestamp: number
  verified: boolean

  constructor(init?: Partial<Channel>) {
    Object.assign(this, init)
  }
}

export class Message {
  channel: string
  address: string
  avatar: Avatar
  budget: string
  name: string
  title: string
  jobId: string
  message: string
  type: MessageType
  price: string
  timestamp: number
  isPublic: boolean
  txHash: string
  constructor(init?: Partial<Message>) {
    Object.assign(this, init)
  }
}

export enum MessageType {
  message = 'MESSAGE',
  request = 'REQUEST',
  offer = 'OFFER',
  jobAction = 'ACTION',
  checkout = 'CHECKOUT',
  tip = 'TIP',
}

@Injectable()
export class ChatService {
  constructor(
    private afs: AngularFirestore,
    private auth: AuthService,
    private router: Router
  ) {}

  async createChannelsAsync(sender: User, receiver: User): Promise<string> {
    const channelId: string = [sender.address, receiver.address]
      .sort()
      .join('-')
    const senderChannel = this.createChannelObject(channelId, receiver)
    const receiverChannel = this.createChannelObject(channelId, sender)
    const senderChannelCreated = await this.saveChannelAsync(
      sender.address,
      senderChannel
    )
    const receiverChannelCreated = await this.saveChannelAsync(
      receiver.address,
      receiverChannel
    )
    return new Promise<string>((resolve, reject) => {
      if (senderChannelCreated && receiverChannelCreated) {
        resolve(channelId)
      }
      resolve(null)
    })
  }

  private async saveChannelAsync(
    channelOwner: string,
    channel: Channel
  ): Promise<boolean> {
    const ref = this.afs
      .collection('chats')
      .doc(channelOwner)
      .collection('channels')
      .doc(`${channel.channel}`)
    return new Promise<boolean>((resolve, reject) => {
      ref
        .snapshotChanges()
        .pipe(take(1))
        .toPromise()
        .then((snap: any) => {
          if (!snap.payload.exists) {
            ref.set(Object.assign({}, channel))
          }
          resolve(true)
        })
        .catch(e => {
          resolve(false)
        })
    })
  }

  async createNewChannel(sender: User, receiver: User) {
    const channelId: string = [sender.address, receiver.address]
      .sort()
      .join('-')
    const path = `chats/${sender.address}/channels/${channelId}`
    this.afs.firestore
      .doc(path)
      .get()
      .then(docSnapshot => {
        if (docSnapshot.exists) {
          // if the channel exists, navigate the user to the chat page.
          this.router.navigateByUrl('inbox/chat?address=' + receiver.address)
        } else {
          this.createAndNavigateToChannel(sender, receiver)
        }
      })
  }

  async hideChannel(userId: string, channelId: string) {
    const path = `chats/${userId}/channels/${channelId}`
    await this.afs.firestore
      .doc(path)
      .update({ message: '', timestamp: Date.now() })
  }

  // create a channel without any message and navigate the user to it
  async createAndNavigateToChannel(sender: User, receiver: User) {
    const channelsCreated = await this.createChannelsAsync(sender, receiver)
    if (channelsCreated) {
      this.router.navigateByUrl('inbox/chat?address=' + receiver.address)
    } else {
      console.log('something wrong with the channels?')
    }
  }

  async sendTipMessage(txHash: string, receiverId: string) {
    const sender = await this.auth.getCurrentUser()
    const channelId = [sender.address, receiverId].sort().join('-')
    const messageText = "I've just tipped you CanYaCoin!"
    const message = {
      txHash,
      ...this.createMessageObject(
        channelId,
        sender,
        messageText,
        MessageType.tip
      ),
    }
    this.sendMessage(sender.address, receiverId, message)
  }

  async sendJobMessages(job: Job, action: IJobAction) {
    const channelId: string = [job.clientId, job.providerId].sort().join('-')
    const sender = await this.auth.getCurrentUser()
    const receiverId =
      action.executedBy === UserType.client ? job.providerId : job.clientId
    let messageText = ''
    switch (action.type) {
      // TODO: Finish these sentences - Dion
      case ActionType.createJob:
        messageText =
          "I've just sent you a job request, is this something you can do?"
        break
      case ActionType.cancelJob:
        messageText = "I've just cancelled a job.. sorry about that!"
        break
      case ActionType.declineTerms:
        messageText =
          'I do not agree with the proposed terms and have declined the job offer.'
        break
      case ActionType.counterOffer:
        messageText = 'I have proposed a counter offer!'
        break
      case ActionType.acceptTerms:
        messageText = 'I have accepted the terms of the job'
        break
      case ActionType.enterEscrow:
        messageText = 'I have deposited funds into the escrow system!'
        break
      default:
        messageText = "I've made a change to our job, can you have a look?"
        break
    }
    const message = this.createMessageObject(
      channelId,
      sender,
      messageText,
      MessageType.jobAction,
      null,
      null,
      job.id
    )
    this.sendMessage(sender.address, receiverId, message)
  }

  // had to make a separate function so it won't break the usual job flow
  async sendPublicJobMessages(
    job: Job,
    action: IJobAction,
    providerId: string,
    sender: User
  ) {
    const channelId: string = [job.clientId, providerId].sort().join('-')
    const msgSender = sender
    const receiverId =
      action.executedBy === UserType.client ? providerId : job.clientId
    let messageText = ''
    switch (action.type) {
      case ActionType.invite:
        messageText = 'I have invited you to my job, can you take a look?'
        break
      case ActionType.bid:
        messageText = "I've sent a bid to your job, can you take a look?"
        break
      case ActionType.declineBid:
        messageText = `Your job bid has been declined by the client.`
        break
      default:
        messageText = "I've sent a response to your public job"
        break
    }
    const message = this.createPublicMessageObject(
      channelId,
      msgSender,
      messageText,
      MessageType.jobAction,
      null,
      null,
      job.id
    )
    this.sendMessage(sender.address, receiverId, message)
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
      this.afs
        .collection('chats')
        .doc(senderId)
        .collection('channels')
        .doc(message.channel)
        .collection('messages')
        .add(Object.assign({}, message))
      this.afs
        .collection('chats')
        .doc(receiverId)
        .collection('channels')
        .doc(message.channel)
        .collection('messages')
        .add(Object.assign({}, message))

      // Update the channel
      this.afs
        .collection('chats')
        .doc(senderId)
        .collection('channels')
        .doc(message.channel)
        .update({
          message: message.message,
          timestamp: Date.now(),
          unreadMessages: false,
        })
      this.afs
        .collection('chats')
        .doc(receiverId)
        .collection('channels')
        .doc(message.channel)
        .update({
          message: message.message,
          timestamp: Date.now(),
          unreadMessages: true,
        })

      this.afs.doc(`notifications/${receiverId}`).set({ chat: true })
    } catch (error) {
      console.error('sendMessage - error', error)
    }
  }

  private createChannelObject(channelId: string, user: User): Channel {
    return new Channel({
      channel: channelId,
      address: user.address,
      avatar: user.avatar,
      name: user.name,
      title: user.title,
      message: '',
      unreadMessages: false,
      timestamp: Date.now(),
    })
  }

  createMessageObject(
    channelId: string,
    user: User,
    message: string,
    type: MessageType = MessageType.message,
    budget: string = '',
    price: string = '',
    jobId: string = ''
  ): Message {
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
      isPublic: false,
      timestamp: Date.now(),
    })
  }

  createPublicMessageObject(
    channelId: string,
    user: User,
    message: string,
    type: MessageType = MessageType.message,
    budget: string = '',
    price: string = '',
    jobId: string = ''
  ): Message {
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
      isPublic: true,
      timestamp: Date.now(),
    })
  }
}
