const RPC_ENDPOINT = 'https://bsc-dataseed.binance.org/';

import axios from 'axios'


// src/app/core-classes/job.ts
enum JobState {
  acceptingOffers = 'Accepting Offers',
  closed = 'Public job closed',
  offer = 'Offer pending',
  cancelled = 'Cancelled',
  cancelledByProvider = 'Cancelled by provider',
  declined = 'Declined',
  providerCounterOffer = 'Provider counter',
  clientCounterOffer = 'Client counter',
  termsAcceptedAwaitingEscrow = 'Awaiting Escrow',
  inEscrow = 'Job started',
  workPendingCompletion = 'Pending completion',
  inDispute = 'Disputed',
  complete = 'Complete',
  processingEscrow = 'Processing Escrow',
  finishingJob = 'Finishing Job',
  reviewed = 'Review added',
  draft = 'Draft',
}


export function bep20TxMonitor(db) {
  return async () => {
  
    console.log(`bep20TxMonitor start`); // debug
    
    /*
    frontend provides these info:
    
    let transaction = {
      id: GenerateGuid(),
      timestamp: Date.now(),
      jobId,
      userId,
      providerId,
      amount,
      escrowAddress,
      token,
      tokenAddress,
      providerAddress,
      hash,
      from,
      to,
      action,
      status:                      'created' 
      // later it will become here 'processed' (if some action was needed)
                                or 'checked' (if already valid) 
                                or 'error' (we'll add errorMessage)
      // here we will add processedTimestamp
    }    
    
    */
    
    const jobsCollection = db.collection('jobs');
    
    const txsCollection = db.collection('bep20-txs');    
    
    const txsCollectionSearch = txsCollection.where('status', '==', 'created');
    const txsSnapshot = await txsCollectionSearch.get();  
    
    let processed = 0;
    
    if (!txsSnapshot.empty) {
      
      for (const doc of txsSnapshot.docs) {
      
        const tx = doc.data();
        
        let newStatus = 'unknown'; // if we can't update this, something went really wrong
        let errorMessage = '';
        
        try {
          // check if it's an action we support
          if (tx.action == 'deposit') {
            /*
            deposit action, job should be in state ...
            */
            // retrieve job
            const jobRef = await jobsCollection.doc(tx.jobId).get();
            if (jobRef.exists) {

              const job = jobRef.data();
              
              if (job.state == JobState.inEscrow) {
                // everything was already processed fine by frontend
                newStatus = 'checked';
                
              } else if (job.state == JobState.termsAcceptedAwaitingEscrow) {
                /*
                good, this is state we have to handle, cause if job is into this state,
                at least one of following steps didn't complete (cause job state update is last one)
                into src/app/inbox/jobs/container/enter-escrow-bsc/enter-escrow-bsc.component.ts:
                
                - create job transaction (firestore transactions table)
                - handleJobAction(enterEscrowBsc) -> (case ActionType.enterEscrowBsc into src/app/core-services/job.service.ts)
                  - add action to action log
                  - update job state to inEscrow
                  - save job to firestore
                  - (optional todo) chatService.sendJobMessages(job, action)
                  - (optional todo) jobNotificationService.notify(action.type, job.id)
                
                */
                
                console.log(`we have to process this state for ${tx.jobId}`); // debug
                
                /*
                but first, check if tx is confirmed on chain
                */
                
                
                let txHash = tx.hash; // bep20 tx hash
                
                if (!txHash) {
                  
                  errorMessage = `Bep 20 tx not found for job id ${tx.jobId}`;
                  
                } else {
                  
                  /* 
                  use json rpc interface
                  curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":[txHash],"id":1}' https://bsc-dataseed.binance.org/
                  if not found: {"jsonrpc":"2.0","id":1,"result":null}
                  if found: {"jsonrpc":"2.0","id":1,"result":{"blockHash":"..","blockNumber":"hex value","from":"..","gas":"hex value","gasPrice":"hex value","hash":txHash,...}}
                    and if confirmed, blockNumber is not null
                    
                  we have to use "eth_getTransactionReceipt" to check status if tx is not failed
                  http://man.hubwiz.com/docset/Ethereum.docset/Contents/Resources/Documents/eth_getTransactionReceipt.html                  
                  */
                  
                  let txSuccess = false;
                  let chainCheckMessage = '';
                  
                  // add also chainCheckMessage if needed
                  try {
                    
                    const { data } = await axios.post(
                      RPC_ENDPOINT,
                      { 
                        "jsonrpc": '2.0',
                        "method": "eth_getTransactionReceipt",
                        "id": 1,
                        "params": 
                          [
                            txHash
                          ]
                        
                      },
                      {
                        headers: {
                          'Content-Type': 'application/json',
                          Accept: 'application/json',
                        },
                      },
                    );

                    // check blockNumber and status
                    
                    if (data.result) {
                      if (data.result.blockNumber) {
                        
                        if (parseInt(data.result.status) === 1) {
                          
                          txSuccess = true;
                          
                          console.log(`Valid data found for tx ${tx.id}: blockNumber ${data.result.blockNumber} and status ${data.result.status}`);                                  
                          
                        } else {
                          
                          chainCheckMessage = `chain tx failed, status ${data.result.status}`; 
                          // we shouldn't process this anymore, tx is failed
                          // flag this record as error
                          errorMessage = `Chain tx is failed with status "${data.result.status}" for job id ${tx.jobId}`;
                          
                          
                        }
                      
                      } else {

                        chainCheckMessage = `chain tx not yet confirmed, blockNumber ${data.result.blockNumber}`; 
                        
                      }
                      
                    } else {
                      
                      chainCheckMessage = `no result from chain with error ${JSON.stringify(data.error)}`; 
                      
                    }


                  } catch (error) {
                    if (axios.isAxiosError(error)) {

                      chainCheckMessage = `axios error "${error.message}"`;

                    } else {
                      chainCheckMessage = `axios unexpected error "${error.toString()}"`;

                      console.log(error);
                      
                    }
                  }  

                  if (txSuccess) {
                    // good to go, everything ok (job status and chain receipt), trigger job actions
                    
                    // and finally update bep20 tx status to processed
                    // TODO
                  } else {
                    // postpone
                    newStatus = 'created'; // reset the status to created so we can process again if tx is not confirmed
                    
                    tx.chainCheckTimestamp = Date.now(); // timestamp of last chain check
                    tx.chainCheckMessage = chainCheckMessage;
                    console.log(`Error checking chain status for tx ${tx.id}: ${chainCheckMessage}`);          
                    
                  }
                  
                  
                }
                
                
              } else {
                
                errorMessage = `Unexpected state "${job.state}" for job id ${tx.jobId}`;
                /*
                into this scenario, job state is different from expected
                probably is a following step (i.e. job cancelled or completed)
                but this would be anyway odd, cause this job runs every minute,
                and it's very unlikely job went to these states into less then 1 minute
                so better to flag bep20 tx as error to check later
                
                */
                
              }
              

              
            } else {

              errorMessage = `Job not found ${tx.jobId}`;
            }
          
          } else {
          
            errorMessage = `Unsupported action ${tx.action}`;
            
          }
          
          
        } catch (err) {
          errorMessage = err.toString();
          
          console.log(err);
        }
        
        /* update values */
        tx.processedTimestamp = Date.now();

        if (errorMessage) {
          // auto set status to error if errorMessage not empty
          
          newStatus = 'error';
          tx.errorMessage = errorMessage;
          console.log(`Error tx ${tx.id}: ${errorMessage}`);          
        }


        tx.status = newStatus;
        
        /* save into firestore */
        txsCollection.doc(tx.id).set(tx);
        
        processed++;
      }
    }

    console.log(`Processed ${processed} bep20 txs`); // debug

    return null;
  }
}
