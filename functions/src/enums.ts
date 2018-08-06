export enum ActionType {
  createJob = 'Create job',
  cancelJob = 'Cancel job', // both sides
  declineTerms = 'Decline terms', // both sides
  counterOffer = 'Counter offer', // both sides
  acceptTerms = 'Accept terms', // both sides
  authoriseEscrow = 'Authorise escrow',
  enterEscrow = 'Send CAN to escrow',
  addMessage = 'Add message', // both sides
  finishedJob = 'Mark as complete',
  acceptFinish = 'Complete job',
  dispute = 'Raise dispute' // both sides
}
