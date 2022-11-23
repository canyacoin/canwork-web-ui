import { UserType } from './user-type'

enum ActionType {
  enterEscrow = 'Pay Escrow'
}

export async function sendJobMessages(db, job, action) {
  const channelId = [job.clientId, job.providerId].sort().join('-')
  const receiverId = ( action.executedBy === UserType.client ) ? job.providerId : job.clientId
  
  // const sender = await this.auth.getCurrentUser()// simpler (todo): the opposite of receiverId
 
  let messageText = '';
  
  switch (action.type) {
    // deposit bnb and bep 20
    case ActionType.enterEscrow:
      messageText = 'I have deposited funds into the escrow system!  Please start the job.'
      break
    
    // todo case for release as provider and client    
  }
  
  if (!messageText) {
    console.log(`Error sending chat notification, unknown action: ${action.type}`);          
    
    return;
  }

  // todo send message creating firestore record
  
  /*
  
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
  */
  
}