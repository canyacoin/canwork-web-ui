import { Component, Input, OnInit } from '@angular/core'
import { AngularFirestore } from 'angularfire2/firestore'
import { User } from '../../../core-classes/user'
import { AngularFireFunctions } from '@angular/fire/functions'
import { SelectParams } from '../../../../../functions/src/firestore'

@Component({
  selector: 'app-profile-visitors',
  templateUrl: './visitors.component.html',
  styleUrls: ['./visitors.component.css'],
})
export class VisitorsComponent implements OnInit {
  @Input() userModel: User
  whoViewProfileCounter = 0

  constructor(
    private afs: AngularFirestore,
    private funcs: AngularFireFunctions
  ) {}

  async ngOnInit() {
    const visitors = await this.funcs
      .httpsCallable<SelectParams, User[]>('firestoreSelect')({
        path: `who/${this.userModel.address}/user`,
        select: ['address'],
      })
      .toPromise()

    this.whoViewProfileCounter = visitors.length
  }
}
