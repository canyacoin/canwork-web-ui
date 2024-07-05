import axios from 'axios'
import { GenerateGuid } from './generate.uid'
import { sendJobMessages } from './chat-notifications'
import { ActionType } from './job-action-type'
import { UserType } from './user-type'
import * as jobEmailfactory from './job-state-email-notification-factory'

/*
plain https call to rpc blockchain endpoint, no dependency on web3 libs (this is segregated to an external chain monitor service)
*/
const RPC_ENDPOINT = 'https://bsc-dataseed.binance.org/'

enum JobState {
  // from src/app/core-classes/job.ts
  acceptingOffers = 'Accepting Offers',
  closed = 'Public job closed',
  offer = 'Offer pending',
  cancelled = 'Cancelled',
  cancelledByProvider = 'Cancelled by provider',
  declined = 'Declined',
  providerCounterOffer = 'Provider counter',
  clientCounterOffer = 'Client counter',
  termsAcceptedAwaitingEscrow = 'Awaiting Escrow',
  inEscrow = 'Funds in Escrow',
  workPendingCompletion = 'Pending completion',
  inDispute = 'Disputed',
  complete = 'Complete',
  processingEscrow = 'Processing Escrow',
  finishingJob = 'Finishing Job',
  reviewed = 'Review added',
  draft = 'Draft',
}

/*
chain listener provides these info:

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
export async function bep20TxProcess(db, tx, env, serviceConfig) {
  const sendgridApiKey = env.sendgrid.apikey

  const jobsCollection = db.collection('jobs')
  const txsCollection = db.collection('bep20-txs')
  const transactionCollection = db.collection('transactions')

  let newStatus = 'unknown' // if we can't update this, something went really wrong
  let errorMessage = ''

  try {
    // check if it's an action we support
    if (tx.action === 'deposit') {
      /*
      deposit action, job should be in state JobState.termsAcceptedAwaitingEscrow
      */
      // retrieve job
      const jobRef = await jobsCollection.doc(tx.jobId).get()
      if (jobRef.exists) {
        const job = jobRef.data()

        // job.state = JobState.termsAcceptedAwaitingEscrow; // force this to debug

        if (job.state === JobState.inEscrow) {
          // everything was already processed fine by frontend
          newStatus = 'checked'
        } else if (job.state === JobState.termsAcceptedAwaitingEscrow) {
          /*
          good, this is state we have to handle, cause if job is into this state,
          at least one of following steps didn't complete (cause job state update is last one)
          into src/app/inbox/jobs/container/enter-escrow-bsc/enter-escrow-bsc.component.ts:
          
          - create job transaction (firestore transactions table)
          - handleJobAction(enterEscrowBsc) -> (case ActionType.enterEscrowBsc into src/app/core-services/job.service.ts)
            - add action to action log
            - update job state to inEscrow
            - save job to firestore
            - chat notifications sendJobMessages
            - send email notifications
              we can invoke job mail sender directly from backend functions without calling endpoint?
          
          */

          console.log(`we have to process this state for ${tx.jobId}`)

          /*
          but first, check if tx is confirmed on chain
          */

          const txHash = tx.hash // bep20 tx hash

          if (!txHash) {
            errorMessage = `Bep 20 tx not found for job id ${tx.jobId}`
          } else {
            let txSuccess = false
            let chainCheckMessage = ''

            // add also chainCheckMessage if needed
            try {
              // destructure to existing vars (wrap all the line into parentheses)
              ;({
                txSuccess,
                chainCheckMessage,
                errorMessage,
              } = await checkChainState(tx))
            } catch (error) {
              if (axios.isAxiosError(error)) {
                chainCheckMessage = `axios error "${error.message}"`
              } else {
                chainCheckMessage = `axios unexpected error "${error.toString()}"`

                console.log(error)
              }
            }

            if (txSuccess) {
              // good to go, everything ok (job status and chain receipt), let's check what's needed

              // transaction, let's check if there is already another one with this same hash
              let existingTransaction = false

              const jobTransactions = transactionCollection.where(
                'jobId',
                '==',
                tx.jobId
              )
              const jobTransactionsSnapshot = await jobTransactions.get()

              if (!jobTransactionsSnapshot.empty) {
                for (const jobTxDoc of jobTransactionsSnapshot.docs) {
                  const jobTx = jobTxDoc.data()
                  if (jobTx.hash.toLowerCase() === txHash.toLowerCase())
                    existingTransaction = true
                }
              }

              if (!existingTransaction) {
                // it doesn't exist, so let's create it
                // these are transactions visible into the ui log under job details

                await createTransaction(
                  `Deposit ${tx.token}`,
                  txHash,
                  tx.jobId,
                  transactionCollection
                )
                console.log(
                  `Created job transaction for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              /* 
              now let's add job action and update job state
              this is atomic into job service, so if job state is not updated (previous check) we can assume for sure also action isn't added to log
              */
              const action = {
                type: ActionType.enterEscrow, // it was 'Pay Bsc Escrow', it should be the same
                executedBy: UserType.client,
                message: '',
                private: false,
                timestamp: Date.now(),
              }

              if (job.actionLog) {
                job.actionLog.push(action)
                console.log(
                  `Created job action for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              job.bscEscrow = true // save bscEscrow property into job to use it later when releasing job

              job.state = JobState.inEscrow

              // save job to firestore
              await jobsCollection.doc(job.id).set(job)

              console.log(`Updated job state for tx ${tx.id}, job ${tx.jobId}`)

              // send notifications

              const jobAction = {
                executedBy: UserType.client,
                type: ActionType.enterEscrow,
              }

              // send chat messages
              await sendJobMessages(db, job, jobAction)
              console.log(
                `Sent chat notifications for tx ${tx.id}, job ${tx.jobId}`
              )

              // send emails
              const jobStateEmailer = jobEmailfactory.notificationEmail(
                jobAction.type
              )

              if (jobStateEmailer === undefined) {
                console.log(
                  `Warning sending email for tx ${tx.id}: there is no AEmailNotification class for type ${jobAction}`
                )
              } else {
                // no need to authenticate request or check angular token, we are on the backend!

                let interpolateOk = true
                try {
                  await jobStateEmailer.interpolateTemplates(db, tx.jobId)
                } catch (e) {
                  console.log(
                    `Error interpolateTemplates for tx ${
                      tx.id
                    }: ${e.toString()}`
                  )
                  console.log(e)
                  interpolateOk = false
                }
                if (interpolateOk) {
                  try {
                    jobStateEmailer.deliver(sendgridApiKey, serviceConfig.uri)
                    console.log(
                      `Enqueued for delivery email notifications for tx ${tx.id}, job ${tx.jobId}`
                    )
                  } catch (e) {
                    console.log(
                      `Error email delivery for tx ${tx.id}, job ${
                        tx.jobId
                      }: ${e.toString()}`
                    )
                    console.log(e)
                  }
                }
              }

              //  update also bep20 monitor status at the end, it will be "processed"
              newStatus = 'processed' // finally
            } else {
              // postpone
              newStatus = 'created' // reset the status to created so we can process again if tx is not confirmed

              tx.chainCheckTimestamp = Date.now() // timestamp of last chain check
              tx.chainCheckMessage = chainCheckMessage
              console.log(
                `Error checking chain status for tx ${tx.id}: ${chainCheckMessage}`
              )
            }
          }
        } else {
          errorMessage = `Unexpected state "${job.state}" for job id ${tx.jobId}`
          /*
          into this scenario, job state is different from expected
          probably is a following step (i.e. job cancelled or completed)
          but this would be anyway odd, cause this job runs every 5 minutes,
          and it's very unlikely job went to these states into less then 5 minutes
          so better to flag bep20 tx as error to check later manually
          
          */
        }
      } else {
        errorMessage = `Job not found ${tx.jobId}`
      }
    } else if (tx.action === 'releaseAsClient') {
      /*
        this the acceptFinish job action, client confirms job is done and release funds      
        job should be in state JobState.workPendingCompletion
      */
      // retrieve job
      const jobRef = await jobsCollection.doc(tx.jobId).get()
      if (jobRef.exists) {
        const job = jobRef.data()

        // job.state = JobState.workPendingCompletion; // force this to debug

        if (job.state === JobState.complete) {
          // everything was already processed fine by frontend
          newStatus = 'checked'
        } else if (job.state === JobState.workPendingCompletion) {
          /*
          good, this is state we have to handle
          */

          console.log(`we have to process this state for ${tx.jobId}`)

          /*
          but first, check if tx is confirmed on chain
          */

          const txHash = tx.hash // bep20 tx hash

          if (!txHash) {
            errorMessage = `Bep 20 tx not found for job id ${tx.jobId}`
          } else {
            let txSuccess = false
            let chainCheckMessage = ''

            // add also chainCheckMessage if needed
            try {
              // destructure to existing vars (wrap all the line into parentheses)
              ;({
                txSuccess,
                chainCheckMessage,
                errorMessage,
              } = await checkChainState(tx))
            } catch (error) {
              if (axios.isAxiosError(error)) {
                chainCheckMessage = `axios error "${error.message}"`
              } else {
                chainCheckMessage = `axios unexpected error "${error.toString()}"`

                console.log(error)
              }
            }

            if (txSuccess) {
              // good to go, everything ok (job status and chain receipt), let's check what's needed

              // transaction, let's check if there is already another one with this same hash
              let existingTransaction = false

              const jobTransactions = transactionCollection.where(
                'jobId',
                '==',
                tx.jobId
              )
              const jobTransactionsSnapshot = await jobTransactions.get()

              if (!jobTransactionsSnapshot.empty) {
                for (const jobTxDoc of jobTransactionsSnapshot.docs) {
                  const jobTx = jobTxDoc.data()
                  if (jobTx.hash.toLowerCase() === txHash.toLowerCase())
                    existingTransaction = true
                }
              }

              if (!existingTransaction) {
                // it doesn't exist, so let's create it
                // these are transactions visible into the ui log under job details
                await createTransaction(
                  `Release funds`,
                  txHash,
                  tx.jobId,
                  transactionCollection
                )
                console.log(
                  `Created job transaction for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              /*
                from src/app/inbox/jobs/container/job-details/job-details.component.ts
                function releaseEscrowBsc
              */

              /* 
              now let's add job action and update job state
              this is atomic into job service, so if job state is not updated (previous check) we can assume for sure also action isn't added to log
              */
              const action = {
                type: ActionType.acceptFinish,
                executedBy: UserType.client,
                message: '',
                private: false,
                timestamp: Date.now(),
              }

              if (job.actionLog) {
                job.actionLog.push(action)
                console.log(
                  `Created job action for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              job.bscEscrow = true // save bscEscrow property into job to use it later when releasing job

              job.state = JobState.complete

              // save job to firestore
              await jobsCollection.doc(job.id).set(job)

              console.log(`Updated job state for tx ${tx.id}, job ${tx.jobId}`)

              // send notifications

              const jobAction = {
                executedBy: UserType.client,
                type: ActionType.acceptFinish,
              }

              // send chat messages
              await sendJobMessages(db, job, jobAction)
              console.log(
                `Sent chat notifications for tx ${tx.id}, job ${tx.jobId}`
              )

              // send emails
              const jobStateEmailer = jobEmailfactory.notificationEmail(
                jobAction.type
              )

              if (jobStateEmailer === undefined) {
                console.log(
                  `Warning sending email for tx ${tx.id}: there is no AEmailNotification class for type ${jobAction}`
                )
              } else {
                // no need to authenticate request or check angular token, we are on the backend!

                let interpolateOk = true
                try {
                  await jobStateEmailer.interpolateTemplates(db, tx.jobId)
                } catch (e) {
                  console.log(
                    `Error interpolateTemplates for tx ${
                      tx.id
                    }: ${e.toString()}`
                  )
                  console.log(e)
                  interpolateOk = false
                }
                if (interpolateOk) {
                  try {
                    jobStateEmailer.deliver(sendgridApiKey, serviceConfig.uri)
                    console.log(
                      `Enqueued for delivery email notifications for tx ${tx.id}, job ${tx.jobId}`
                    )
                  } catch (e) {
                    console.log(
                      `Error email delivery for tx ${tx.id}, job ${
                        tx.jobId
                      }: ${e.toString()}`
                    )
                    console.log(e)
                  }
                }
              }

              //  update also bep20 monitor status at the end, it will be "processed"
              newStatus = 'processed' // finally
            } else {
              // postpone
              newStatus = 'created' // reset the status to created so we can process again if tx is not confirmed

              tx.chainCheckTimestamp = Date.now() // timestamp of last chain check
              tx.chainCheckMessage = chainCheckMessage
              console.log(
                `Error checking chain status for tx ${tx.id}: ${chainCheckMessage}`
              )
            }
          }
        } else {
          errorMessage = `Unexpected state "${job.state}" for job id ${tx.jobId}`
          /*
          into this scenario, job state is different from expected
          probably is a following step (i.e. job cancelled or completed)
          but this would be anyway odd, cause this job runs every 5 minutes,
          and it's very unlikely job went to these states into less then 5 minutes
          so better to flag bep20 tx as error to check later manually
          
          */
        }
      } else {
        errorMessage = `Job not found ${tx.jobId}`
      }
    } else if (tx.action === 'releaseByProvider') {
      /*
        this is the releaseByProvider job action, provider cancels job early and funds come back to client  
        job should be in state JobState.inEscrow
        
      */
      // retrieve job
      const jobRef = await jobsCollection.doc(tx.jobId).get()
      if (jobRef.exists) {
        const job = jobRef.data()

        // job.state = JobState.inEscrow; // force this to debug

        if (job.state === JobState.cancelledByProvider) {
          // already processed
          newStatus = 'checked'
        } else if (job.state === JobState.inEscrow) {
          /*
          good, this is state we have to handle
          */

          console.log(`we have to process this state for ${tx.jobId}`)

          /*
          but first, check if tx is confirmed on chain
          */

          const txHash = tx.hash // bep20 tx hash

          if (!txHash) {
            errorMessage = `Bep 20 tx not found for job id ${tx.jobId}`
          } else {
            let txSuccess = false
            let chainCheckMessage = ''

            // add also chainCheckMessage if needed
            try {
              // destructure to existing vars (wrap all the line into parentheses)
              ;({
                txSuccess,
                chainCheckMessage,
                errorMessage,
              } = await checkChainState(tx))
            } catch (error) {
              if (axios.isAxiosError(error)) {
                chainCheckMessage = `axios error "${error.message}"`
              } else {
                chainCheckMessage = `axios unexpected error "${error.toString()}"`

                console.log(error)
              }
            }

            if (txSuccess) {
              // good to go, everything ok (job status and chain receipt), let's check what's needed

              // transaction, let's check if there is already another one with this same hash
              let existingTransaction = false

              const jobTransactions = transactionCollection.where(
                'jobId',
                '==',
                tx.jobId
              )
              const jobTransactionsSnapshot = await jobTransactions.get()

              if (!jobTransactionsSnapshot.empty) {
                for (const jobTxDoc of jobTransactionsSnapshot.docs) {
                  const jobTx = jobTxDoc.data()
                  if (jobTx.hash.toLowerCase() === txHash.toLowerCase())
                    existingTransaction = true
                }
              }

              if (!existingTransaction) {
                // it doesn't exist, so let's create it
                // these are transactions visible into the ui log under job details
                await createTransaction(
                  `Cancel job early`,
                  txHash,
                  tx.jobId,
                  transactionCollection
                )
                console.log(
                  `Created job transaction for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              /* 
              now let's add job action and update job state
              this is atomic into job service, so if job state is not updated (previous check) we can assume for sure also action isn't added to log
              */
              const action = {
                type: ActionType.cancelJobEarly,
                executedBy: UserType.provider,
                message: '',
                private: false,
                timestamp: Date.now(),
              }

              if (job.actionLog) {
                job.actionLog.push(action)
                console.log(
                  `Created job action for tx ${tx.id}, job ${tx.jobId}`
                )
              }

              job.state = JobState.cancelledByProvider

              // save job to firestore
              await jobsCollection.doc(job.id).set(job)

              console.log(`Updated job state for tx ${tx.id}, job ${tx.jobId}`)

              // send notifications

              const jobAction = {
                executedBy: UserType.provider,
                type: ActionType.cancelJobEarly,
              }

              // send chat messages
              await sendJobMessages(db, job, jobAction)
              console.log(
                `Sent chat notifications for tx ${tx.id}, job ${tx.jobId}`
              )

              // send emails
              const jobStateEmailer = jobEmailfactory.notificationEmail(
                jobAction.type
              )

              if (jobStateEmailer === undefined) {
                console.log(
                  `Warning sending email for tx ${tx.id}: there is no AEmailNotification class for type ${jobAction}`
                )
              } else {
                // no need to authenticate request or check angular token, we are on the backend!

                let interpolateOk = true
                try {
                  await jobStateEmailer.interpolateTemplates(db, tx.jobId)
                } catch (e) {
                  console.log(
                    `Error interpolateTemplates for tx ${
                      tx.id
                    }: ${e.toString()}`
                  )
                  console.log(e)
                  interpolateOk = false
                }
                if (interpolateOk) {
                  try {
                    jobStateEmailer.deliver(sendgridApiKey, serviceConfig.uri)
                    console.log(
                      `Enqueued for delivery email notifications for tx ${tx.id}, job ${tx.jobId}`
                    )
                  } catch (e) {
                    console.log(
                      `Error email delivery for tx ${tx.id}, job ${
                        tx.jobId
                      }: ${e.toString()}`
                    )
                    console.log(e)
                  }
                }
              }

              //  update also bep20 monitor status at the end, it will be "processed"
              newStatus = 'processed' // finally
            } else {
              // postpone
              newStatus = 'created' // reset the status to created so we can process again if tx is not confirmed

              tx.chainCheckTimestamp = Date.now() // timestamp of last chain check
              tx.chainCheckMessage = chainCheckMessage
              console.log(
                `Error checking chain status for tx ${tx.id}: ${chainCheckMessage}`
              )
            }
          }
        } else {
          errorMessage = `Unexpected state "${job.state}" for job id ${tx.jobId}`
          /*
          into this scenario, job state is different from expected
          probably is a following step (i.e. job cancelled or completed)
          but this would be anyway odd, cause this job runs every 5 minutes,
          and it's very unlikely job went to these states into less then 5 minutes
          so better to flag bep20 tx as error to check later manually
          
          */
        }
      } else {
        errorMessage = `Job not found ${tx.jobId}`
      }
    } else {
      errorMessage = `Unsupported action ${tx.action}`
    }
  } catch (err) {
    errorMessage = err.toString()

    console.log(err)
  }

  /* update values */
  tx.processedTimestamp = Date.now()

  if (errorMessage) {
    // auto set status to error if errorMessage not empty

    newStatus = 'error'
    tx.errorMessage = errorMessage
    console.log(`Error tx ${tx.id}: ${errorMessage}`)
  }

  tx.status = newStatus

  /* save into firestore */
  await txsCollection.doc(tx.id).set(tx)
}

async function createTransaction(
  actionType,
  hash,
  jobId,
  transactionCollection
) {
  const transaction = {
    actionType,
    hash,
    id: GenerateGuid(),
    jobId,
    timestamp: Date.now(),
  }

  return transactionCollection.doc(transaction.id).set(transaction)
}

async function checkChainState(tx) {
  /* 
  use plain json rpc interface
  curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":[txHash],"id":1}' https://bsc-dataseed.binance.org/
  if not found: {"jsonrpc":"2.0","id":1,"result":null}
  if found: {"jsonrpc":"2.0","id":1,"result":{"blockHash":"..","blockNumber":"hex value","from":"..","gas":"hex value","gasPrice":"hex value","hash":txHash,...}}
    and if confirmed, blockNumber is not null
    
  we have to use "eth_getTransactionReceipt" to check status if tx is not failed
  http://man.hubwiz.com/docset/Ethereum.docset/Contents/Resources/Documents/eth_getTransactionReceipt.html                  
  */
  const txHash = tx.hash // bep20 tx hash

  let txSuccess = false
  let chainCheckMessage = ''
  let errorMessage = ''

  const { data } = await axios.post(
    RPC_ENDPOINT,
    {
      jsonrpc: '2.0',
      method: 'eth_getTransactionReceipt',
      id: 1,
      params: [txHash],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )

  // check blockNumber and status

  if (data.result) {
    if (data.result.blockNumber) {
      if (parseInt(data.result.status) === 1) {
        txSuccess = true

        console.log(
          `Valid data found for tx ${tx.id}: blockNumber ${data.result.blockNumber} and status ${data.result.status}`
        )
      } else {
        chainCheckMessage = `chain tx failed, status ${data.result.status}`
        // we shouldn't process this anymore, tx is failed
        // flag this record as error
        errorMessage = `Chain tx is failed with status "${data.result.status}" for job id ${tx.jobId}`
      }
    } else {
      chainCheckMessage = `chain tx not yet confirmed, blockNumber ${data.result.blockNumber}`
    }
  } else {
    chainCheckMessage = `no result from chain, received data: ${JSON.stringify(
      data
    )}`
  }

  return { txSuccess, chainCheckMessage, errorMessage }
}
