import { Component, Input, OnInit, Directive } from '@angular/core'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { User } from '../../../core-classes/user'
import { AngularFireFunctions } from '@angular/fire/compat/functions'
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
