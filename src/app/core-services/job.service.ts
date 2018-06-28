import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';

@Injectable()
export class JobService {

  constructor(private afs: AngularFirestore) { }

}
