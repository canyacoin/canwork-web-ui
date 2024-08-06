import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { User } from '../../../core-classes/user'
import { Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { CertificationsService } from '../../../core-services/certifications.service'
import { Certification } from '@class/certification'

interface itemType {
  label: string
  icon: string
}

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

  userCertifications: Certification[]
  loaded = false
  certificationSub: Subscription

  items: itemType[]
  selectedItem: itemType | undefined

  constructor(
    private afs: AngularFirestore,
    private certifications: CertificationsService
  ) {}

  ngOnInit() {
    this.loadCertifications()
    this.items = [
      {
        label: 'Edit',
        icon: 'fi_edit.svg',
      },
      {
        label: 'Delete',
        icon: 'delete.svg',
      },
    ]

    this.selectedItem = this.items[0]
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
      .subscribe((data: Certification[]) => {
        this.userCertifications = data
        console.log('certification data:', data)
        if (data.length >= 0) {
          this.loaded = true
        }
      })
  }

  setEditModal(cert: Certification) {
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
