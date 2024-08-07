import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  Directive,
} from '@angular/core'
import { User } from '../../../core-classes/user'
import { Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { CertificationsService } from '../../../core-services/certifications.service'

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
})
export class CertificationsComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean
  @Input() notMyProfile: boolean
  @Output() editCertification = new EventEmitter()

  visibleCertificationDialog: boolean = false

  userCertifications: any
  loaded = false
  certificationSub: Subscription
  constructor(
    private afs: AngularFirestore,
    private certifications: CertificationsService
  ) {}

  ngOnInit() {
    this.loadCertifications()
  }

  OnDestroy() {
    this.certificationSub.unsubscribe()
  }

  onInputChange() {}

  onDeleteCertification() {
    console.log('deleting')
  }

  async loadCertifications() {
    const certifications = this.afs.collection(
      `users/${this.userModel.address}/certifications`
    )
    this.certificationSub = certifications
      .valueChanges()
      .subscribe((data: any) => {
        this.userCertifications = data
        if (data.length >= 0) {
          this.loaded = true
        }
      })
  }

  setEditModal(cert) {
    this.certifications.loadEditCert(cert)
  }

  setAddModal() {
    this.certifications.loadAddCert()
  }
  showCertificationDialog() {
    this.visibleCertificationDialog = true
    this.setAddModal()
  }
}
