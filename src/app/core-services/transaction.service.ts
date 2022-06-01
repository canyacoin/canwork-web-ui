import { Injectable } from '@angular/core'
import { Http } from '@angular/http'
import { ActionType } from '@class/job-action'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { GenerateGuid } from '@util/generate.uid'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from 'angularfire2/firestore'


import { environment } from '@env/environment'

export const BEPESCROW_JOB_API_URL = `${environment.binance.escrowUrl}/job/`

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
  // TODO: remove 'success', 'failure' temporary properties
  success: boolean
  failure: boolean
}

const mapEventToActionType = {
  ESCROW: ActionType.enterEscrow,
  DISBURSE: ActionType.acceptFinish,
  RELEASE: ActionType.releaseEscrow,
  REFUND: ActionType.refundEscrow,
  VALUE: ActionType.valueEscrow,
}


/* OBSOLETE */
function createTx(jobId: string, event: Event): Transaction {
  const actionType = mapEventToActionType[event.event]
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
    // TODO: remove 'success', 'failure' temporary properties
    success: true,
    failure: false,
  }
}

@Injectable()
export class TransactionService {
  
  transactionCollection: AngularFirestoreCollection<any>  
  
  constructor(
    private http: Http,    
    private afs: AngularFirestore
    
  ) {
    
    this.transactionCollection = this.afs.collection<any>('transactions')    
    
  }
  
  async createTransaction(actionType, hash, jobId): Promise<any> {
    let transaction = {
      actionType,
      hash,
      id: GenerateGuid(),
      jobId,
      timestamp: Date.now()      
    }
    
    return this.transactionCollection.doc(transaction.id).set(transaction)
  }  
    
  getTransactionsByJob(jobId: string): Observable<Transaction[]> {
    return this.afs
      .collection<any>('transactions', ref => ref.where('jobId', '==', jobId))
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(a => {
            const data = a.payload.doc.data()
            data.id = a.payload.doc.id
            return data
          })
        })
      )
  }
    

  /** Get transactions by Job (OBSOLETE, bep escrow no more existing */
  /*
  getTransactionsByJob(jobId: string): Observable<Transaction[]> {
    const url = BEPESCROW_JOB_API_URL + jobId
    return this.http.get(url).pipe(
      map((resp): Job => resp.json()),
      map(job => job.events.map(event => createTx(jobId, event))),
      catchError(err => {
        console.log(err)
        return []
      })
    )
  }
  */
}
