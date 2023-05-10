import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { GenerateGuid } from '@util/generate.uid'
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore'

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

@Injectable()
export class TransactionService {
  transactionCollection: AngularFirestoreCollection<any>

  constructor(private http: HttpClient, private afs: AngularFirestore) {
    this.transactionCollection = this.afs.collection<any>('transactions')
  }

  async createTransaction(actionType, hash, jobId): Promise<any> {
    let transaction = {
      actionType,
      hash,
      id: GenerateGuid(),
      jobId,
      timestamp: Date.now(),
    }

    return this.transactionCollection.doc(transaction.id).set(transaction)
  }

  getTransactionsByJob(jobId: string): Observable<Transaction[]> {
    return this.afs
      .collection<any>('transactions', (ref) => ref.where('jobId', '==', jobId))
      .snapshotChanges()
      .pipe(
        map((changes) => {
          return changes.map((a) => {
            const data = a.payload.doc.data()
            data.id = a.payload.doc.id
            return data
          })
        })
      )
  }
}
