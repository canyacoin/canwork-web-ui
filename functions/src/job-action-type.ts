export enum ActionType {
  createJob = 'Create job', // notifies provider
  cancelJob = 'Cancel job', // depends on caller
  cancelJobEarly = 'Cancel job early', // notifies client
  declineTerms = 'Decline terms', // both sides
  counterOffer = 'Counter offer', // both sides
  acceptTerms = 'Accept terms', // both sides
  enterEscrow = 'Pay Escrow', // notifies provider
  enterEscrowFailed = 'Send tokens to escrow failed', // notifies provider about failed tx
  addMessage = 'Add Note', // both sides
  finishedJob = 'Mark as complete', // notifies client
  acceptFinish = 'Complete job', // notifies provider
  dispute = 'Raise dispute', // depends on caller
  bid = 'Place Bid', //
  releaseEscrow = 'Release escrow',
  refundEscrow = 'Refund escrow',
}
