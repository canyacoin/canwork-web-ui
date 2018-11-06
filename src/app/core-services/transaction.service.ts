import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Job } from '@class/job';
import { ActionType } from '@class/job-action';
import { UserService } from '@service/user.service';
import { GenerateGuid } from '@util/generate.uid';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export class Transaction {
  id: string;
  senderId: string;
  jobId: string;
  hash: string;
  timestamp: string;
  actionType: string;
  success = false;
  failure = false;

  constructor(id = GenerateGuid(), senderId, hash, timestamp, actionType, jobId = '') {
    this.id = id;
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

export interface MonitorRequest {
  hash: string;
  from: string;
  webhookOnSuccess: string;
  webhookOnTimeout: string;
  webhookOnError: string;
}

@Injectable()
export class TransactionService {

  transactionCollection: AngularFirestoreCollection<any>;

  constructor(
    private afs: AngularFirestore,
    private http: Http,
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

  /** Update tx in firebase */
  async saveTransaction(tx: Transaction): Promise<any> {
    const x = await this.parseTxToObject(tx);
    return this.transactionCollection.doc(tx.id).set(x);
  }


  /** Start monitoring a transaction on the back end */
  async startMonitoring(job: Job, from: string, txId: string, txHash: string, actionType: ActionType) {
    // start monitoring the transaction
    const success = this.getCallbackUrl(job, txId, actionType, true);
    const failure = this.getCallbackUrl(job, txId, actionType);

    const headers = new Headers({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    const reqBody: MonitorRequest = {
      hash: txHash,
      from: from,
      webhookOnSuccess: success,
      webhookOnTimeout: failure,
      webhookOnError: failure
    };

    console.log(JSON.stringify(reqBody));
    console.log(JSON.stringify(headers));
    try {
      const res = await this.http.post(environment.transactionMonitor.monitorUri, reqBody, { headers: headers });

      res.subscribe(data => {
        console.log('+ Cool, sent');
      }, error => {
        console.log(`+ UH OH: ${error.status} monitoring tx:`, error);
      });

    } catch (error) {
      console.error(`! http post error sending notification to monitor: ${environment.transactionMonitor.monitorUri}`, error);
    }
  }

  private getCallbackUrl(job: Job, txId: string, action: ActionType, success = false): string {
    const prefix = `${environment.transactionMonitor.callbackUri}/`;
    const postfix = success ? 'success' : 'failure';
    const params = `?txID=${txId}&jobID=${job.id}&jobHexID=${job.hexId}`;

    if (action === ActionType.authoriseEscrow) {
      return `${prefix}authorise-escrow-${postfix}${params}`;
    } else if (action === ActionType.enterEscrow) {
      return `${prefix}enter-escrow-${postfix}${params}`
    } else if (action === ActionType.acceptFinish) {
      return `${prefix}accept-finish-${postfix}${params}`
    }
    return '';
  }

  /** Tx object must be re-assigned as firebase doesn't accept strong types */
  private parseTxToObject(tx: Transaction): Promise<object> {
    return Promise.resolve(Object.assign({}, tx));
  }
}
