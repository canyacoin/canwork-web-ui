import { Component, OnInit, Input } from '@angular/core'
import { User } from '@class/user'
import { Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { EducationsService } from '@service/educations.service'
import { Education } from '@class/education'

interface itemType {
  label: string
  code: string
  icon: string
}
@Component({
  selector: 'app-profile-educations',
  templateUrl: './education.component.html',
})
export class EducationComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean

  selectedEducation: Education | null = null

  visibleEducationDialog: boolean = false
  visibleDeleteEducationDialog: boolean = false

  userEducations: Education[]
  loaded = false
  educationSub: Subscription

  items: itemType[]
  selectedItem: itemType | undefined

  constructor(
    private afs: AngularFirestore,
    public educations: EducationsService
  ) {}

  ngOnInit() {
    this.loadEducations()
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
    this.educationSub.unsubscribe()
  }

  async loadEducations() {
    const educations = this.afs.collection(
      `users/${this.userModel.address}/educations`
    )
    console.log(
      '==================================================================================================='
    )
    console.log('educations', educations)
    this.educationSub = educations
      .valueChanges()
      .subscribe((data: Education[]) => {
        this.userEducations = data
        console.log('education data:', data)
        if (data.length >= 0) {
          this.loaded = true
        }
      })
  }
  showEducationDialog() {
    this.visibleEducationDialog = true
  }

  showEditEducationDialog(item: itemType, cert: Education) {
    this.selectedEducation = cert
    this.selectedItem = item
    if (item.code === 'edit') this.visibleEducationDialog = true
    else if (item.code === 'delete') this.visibleDeleteEducationDialog = true
  }

  onDeleteEducation() {
    this.educations.deleteEducation(
      this.selectedEducation,
      this.userModel.address
    )
  }
}
