export enum ActionType {
    createJob = 'Create job', // provider
    cancelJob = 'Cancel job', // both sides
    declineTerms = 'Decline terms', // both sides
    counterOffer = 'Counter offer', // both sides
    acceptTerms = 'Accept terms', // both sides
    authoriseEscrow = 'Authorise escrow', // provider
    enterEscrow = 'Send CAN to escrow', // provider
    addMessage = 'Add message', // both sides
    finishedJob = 'Mark as complete', // client
    acceptFinish = 'Complete job', // provider
    dispute = 'Raise dispute' // both sides
}