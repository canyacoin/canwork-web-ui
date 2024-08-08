import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core'
import { User } from '../../../core-classes/user'
import { Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { CertificationsService } from '../../../core-services/certifications.service'
import { Certification } from '@class/certification'

interface itemType {
  label: string
  code: string
  icon: string
}

@Component({
  selector: 'app-certifications',
  templateUrl: './certifications.component.html',
})
export class CertificationsComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean
  @Output() editCertification = new EventEmitter()

  selectedCertification: Certification | null = null

  visibleCertificationDialog: boolean = false
  visibleDeleteCertificationDialog: boolean = false

  userCertifications: Certification[]
  loaded = false
  certificationSub: Subscription

  items: itemType[]
  selectedItem: itemType | undefined

  constructor(
    private afs: AngularFirestore,
    public certifications: CertificationsService
  ) {}

  ngOnInit() {
    this.loadCertifications()
    this.items = [
      {
        label: 'Edit',
        code: 'edit',
        icon: 'fi_edit.svg',
      },
      {
        label: 'Delete',
        code: 'delete',
        icon: 'delete.svg',
      },
    ]

    this.selectedItem = this.items[0]
  }

  OnDestroy() {
    this.certificationSub.unsubscribe()
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
  showCertificationDialog() {
    this.visibleCertificationDialog = true
  }

  showEditCertificationDialog(item: itemType, cert: Certification) {
    this.selectedCertification = cert
    this.selectedItem = item
    if (item.code === 'edit') this.visibleCertificationDialog = true
    else if (item.code === 'delete')
      this.visibleDeleteCertificationDialog = true
  }

  onDeleteCertification() {
    this.certifications.deleteCertification(
      this.selectedCertification,
      this.userModel.address
    )
  }
}
