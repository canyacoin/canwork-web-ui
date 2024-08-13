import { Component, OnInit, Input } from '@angular/core'
import { User } from '@class/user'
import { Subscription } from 'rxjs'
import { AngularFirestore } from '@angular/fire/compat/firestore'
import { Workhistory } from '@class/workhistory'
import { WorkhistoryService } from '@service/workhistory.service'

interface itemType {
  label: string
  code: string
  icon: string
}

@Component({
  selector: 'app-profile-workhistory',
  templateUrl: './workhistory.component.html',
})
export class WorkhistoryComponent implements OnInit {
  @Input() userModel: User
  @Input() isMyProfile: boolean
  selectedWorkhistory: Workhistory | null = null

  visibleWorkhistoryDialog: boolean = false
  visibleDeleteWorkhistoryDialog: boolean = false

  userWorkhistorys: Workhistory[]
  loaded = false
  workhistorySub: Subscription

  items: itemType[]
  selectedItem: itemType | undefined

  constructor(
    private afs: AngularFirestore,
    public workhistorys: WorkhistoryService
  ) {}

  ngOnInit() {
    this.loadWorkhistorys()
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
    this.workhistorySub.unsubscribe()
  }

  async loadWorkhistorys() {
    const workhistorys = this.afs.collection(
      `users/${this.userModel.address}/workhistorys`
    )
    console.log('workhistorys', workhistorys)
    this.workhistorySub = workhistorys
      .valueChanges()
      .subscribe((data: Workhistory[]) => {
        this.userWorkhistorys = data
        console.log('workhistory data:', data)
        if (data.length >= 0) {
          this.loaded = true
        }
      })
  }
  showWorkhistoryDialog() {
    this.selectedWorkhistory = null
    this.visibleWorkhistoryDialog = true
  }

  showEditWorkhistoryDialog(item: itemType, workhistory: Workhistory) {
    this.selectedWorkhistory = workhistory
    this.selectedItem = item
    if (item.code === 'edit') this.visibleWorkhistoryDialog = true
    else if (item.code === 'delete') this.visibleDeleteWorkhistoryDialog = true
  }

  onDeleteWorkhistory() {
    this.workhistorys.deleteWorkhistory(
      this.selectedWorkhistory,
      this.userModel.address
    )
  }
}
