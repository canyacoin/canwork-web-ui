export enum ActionType {
  createJob = 'Create job', // notifies provider
  cancelJob = 'Cancel job', // depends on caller
  declineTerms = 'Decline terms', // both sides
  counterOffer = 'Counter offer', // both sides
  acceptTerms = 'Accept terms', // both sides
  authoriseEscrow = 'Authorise escrow', // notifies provider
  enterEscrow = 'Send CAN to escrow', // notifies provider
  addMessage = 'Add message', // both sides
  finishedJob = 'Mark as complete', // notifies client
  acceptFinish = 'Complete job', // notifies provider
  dispute = 'Raise dispute' // depends on caller
}
