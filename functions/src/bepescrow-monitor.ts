import { firestore } from 'firebase-admin'
import fetch from 'node-fetch'

import { ActionType } from './job-action-type'

export interface Escrow {
  amount: number
  asset: string
  hash: string
  payer: string
  time: number
  value: number
}

export interface Payout {
  amount: number
  asset: string
  hash: string
  payer: string
  time: number
  value: number
}

export interface Event {
  event: string
  hash: string
  time: number
}

export interface Job {
  id: string
  status: string
  escrow: Escrow
  events: Event[]
  payout: Payout
}

export interface Stats {
  active: number
  disbursed: number
  refunded: number
  total: number
}

export interface Result {
  jobs: Job[]
  stats: Stats
  status: string
}

export interface Transaction {
  jobId: string
  actionType: string
  timestamp: number
  hash: string
}

const BEPESCROW_API_URL = 'https://bepescrow.herokuapp.com/jobs'

const mapEventToActioType = {
  ESCROW: ActionType.enterEscrow,
  DISBURSE: ActionType.acceptFinish,
  RELEASE: ActionType.releaseEscrow,
  REFUND: ActionType.refundEscrow,
}

function createTx(jobId: string, event: Event): Transaction {
  const actionType = mapEventToActioType[event.event]
  if (!actionType) {
    throw new Error(
      `Not found action type for event "${event.event}" (jobId = "${jobId}")`
    )
  }
  return {
    jobId,
    actionType,
    timestamp: event.time,
    hash: event.hash,
  }
}

export const bepescrowMonitor = (db: firestore.Firestore) => async () => {
  const resp = await fetch(BEPESCROW_API_URL)
  const result: Result = await resp.json()

  for (const job of result.jobs) {
    for (const event of job.events) {
      const tx = createTx(job.id, event)
      await db.runTransaction(async tr => {
        const ref = db.doc(`transactions/${tx.hash}`)

        const doc = await tr.get(ref)
        if (!doc.exists) {
          try {
            await tr.create(ref, tx)
          } catch (e) {
            console.log(`transaction ${tx.hash} already exists`)
          }
        }
      })
    }
  }
}
