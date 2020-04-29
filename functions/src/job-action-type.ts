export enum ActionType {
  createJob = 'Create job', // notifies provider
  cancelJob = 'Cancel job', // depends on caller
  declineTerms = 'Decline terms', // both sides
  counterOffer = 'Counter offer', // both sides
  acceptTerms = 'Accept terms', // both sides
  authoriseEscrow = 'Authorise escrow', // notifies provider
  authoriseEscrowFailed = 'Authorise escrow failed', // notifies provider about failed tx
  enterEscrow = 'Send tokens to escrow', // notifies provider
  enterEscrowFailed = 'Send tokens to escrow failed', // notifies provider about failed tx
  addMessage = 'Add Note', // both sides
  finishedJob = 'Mark as complete', // notifies client
  acceptFinish = 'Complete job', // notifies provider
  acceptFinishFailed = 'Complete job failed', // notifies provider
  dispute = 'Raise dispute', // depends on caller
  bid = 'Place Bid', //
  releaseEscrow = 'Release escrow',
  refundEscrow = 'Refund escrow',
}
