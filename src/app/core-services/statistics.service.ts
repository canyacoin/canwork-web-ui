import { Injectable } from '@angular/core'
import { AngularFirestore } from '@angular/fire/firestore'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  constructor(private afs: AngularFirestore) {}

  getStatistics(): Observable<any> {
    return this.afs.collection<any>(`statistics`, (ref) => ref).valueChanges()
  }
}
