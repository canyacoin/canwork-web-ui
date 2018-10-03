import { Injectable } from '@angular/core';
import { ActionType } from '@class/job-action';
import { UserService } from '@service/user.service';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

export class Transaction {
  id: string;
  senderId: string;
  jobId: string;
  hash: string;
  timestamp: string;
  actionType: string;
  success = false;
  failure = false;

  constructor(senderId, hash, timestamp, actionType, jobId = '') {
    this.senderId = senderId;
    this.hash = hash;
    this.timestamp = timestamp;
    this.actionType = actionType;
    this.jobId = jobId;
  }

  init(init?: Partial<Transaction>) {
    Object.assign(this, init);
  }
}

@Injectable()
export class TransactionService {

  transactionCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore,
    private userService: UserService) {
    this.transactionCollection = this.afs.collection<any>('transactions');
  }

  /** Get transactions by Job */
  getTransactionsByJob(jobId: string): Observable<Transaction[]> {
    return this.afs.collection<any>('transactions', ref => ref.where('jobId', '==', jobId)).snapshotChanges().map(changes => {
      return changes.map(a => {
        const data = a.payload.doc.data() as Transaction;
        data.id = a.payload.doc.id;
        return data;
      });
    });
  }

  /** Save tx to firebase */
  async createTransaction(tx: Transaction): Promise<any> {
    const x = await this.parseTxToObject(tx);
    return this.transactionCollection.add(x);
  }

  /** Save tx to firebase */
  async saveTransaction(tx: Transaction): Promise<any> {
    const x = await this.parseTxToObject(tx);
    return this.transactionCollection.doc(tx.id).set(x);
  }


  /** Start monitoring a transaction on the back end */
  startMonitoring(JobId: string, txHash: string, actionType: ActionType): any {
    // start monitoring the transaction
  }

  /** Tx object must be re-assigned as firebase doesn't accept strong types */
  private parseTxToObject(tx: Transaction): Promise<object> {
    return Promise.resolve(Object.assign({}, tx));
  }
}
