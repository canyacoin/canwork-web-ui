import { UserType } from './user-type'

import { ActionType } from './job-action-type'

enum MessageType {
  message = 'MESSAGE',
  request = 'REQUEST',
  offer = 'OFFER',
  jobAction = 'ACTION',
  checkout = 'CHECKOUT',
  tip = 'TIP',
}

export async function sendJobMessages(db, job, action) {
  const channelId = [job.clientId, job.providerId].sort().join('-')
  const jobId = job.id
  //console.log('action executed by '+ action.executedBy); // debug
  //console.log('UserType.client '+ UserType.client); // debug
  //console.log('job.providerId '+ job.providerId); // debug
  //console.log('job.clientId '+ job.clientId); // debug

  const receiverId =
    action.executedBy === UserType.client ? job.providerId : job.clientId
  // the opposite
  const senderId =
    action.executedBy === UserType.client ? job.clientId : job.providerId
  //console.log('receiverId '+ receiverId); // debug
  //console.log('senderId '+ senderId); // debug

  let sender = null
  // get sender from senderId
  const senderRef = await db
    .collection('users')
    .doc(senderId)
    .get()
  if (senderRef.exists) sender = senderRef.data()

  if (!sender) {
    console.log(
      `Error sending chat notification, job ${jobId}, sender not found: ${senderId}`
    )
    return false
  }

  let messageText = ''

  switch (action.type) {
    // deposit bnb and bep 20
    case ActionType.enterEscrow:
      messageText =
        'I have deposited funds into the escrow system!  Please start the job.'
      break
    case ActionType.acceptFinish:
      messageText = 'I have released the funds from Escrow!  Thankyou.'
      break
    case ActionType.cancelJobEarly:
      messageText = "I've just cancelled a job early.. sorry about that!"
      break
  }

  if (!messageText) {
    console.log(
      `Error sending chat notification, job ${jobId}, unknown action: ${action.type}`
    )

    return false
  }

  const user = sender
  const type = MessageType.jobAction

  // send message creating firestore record
  const message = {
    channel: channelId,
    address: user.address,
    avatar: user.avatar,
    budget: '', // unused in this case
    name: user.name,
    title: user.title,
    jobId: jobId,
    message: messageText,
    type: type,
    isPublic: false,
    timestamp: Date.now(),
  }

  try {
    // Save messages
    db.collection('chats')
      .doc(senderId)
      .collection('channels')
      .doc(message.channel)
      .collection('messages')
      .add(Object.assign({}, message))
    db.collection('chats')
      .doc(receiverId)
      .collection('channels')
      .doc(message.channel)
      .collection('messages')
      .add(Object.assign({}, message))

    // Update the channel
    db.collection('chats')
      .doc(senderId)
      .collection('channels')
      .doc(message.channel)
      .update({
        message: message.message,
        timestamp: Date.now(),
        unreadMessages: false,
      })
    db.collection('chats')
      .doc(receiverId)
      .collection('channels')
      .doc(message.channel)
      .update({
        message: message.message,
        timestamp: Date.now(),
        unreadMessages: true,
      })

    db.doc(`notifications/${receiverId}`).set({ chat: true })

    return true
  } catch (e) {
    console.log(
      `Error sending chat notification, job ${jobId}: ${e.toString()}`
    )
    console.log(e)
  }

  return false
}
