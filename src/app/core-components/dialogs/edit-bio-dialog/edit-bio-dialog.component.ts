import {
  Component,
  EventEmitter,
  Input,
  Output,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'

import { customAngularEditorConfig } from 'app/core-functions/angularEditorConfig'

import { isPlatformBrowser, isPlatformServer } from '@angular/common'

@Component({
  selector: 'edit-bio-dialog',
  templateUrl: './edit-bio-dialog.component.html',
})
export class EditBioDialogComponent {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.buildForm()
    if (this.currentUser) {
      //skills tag?
    }
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() currentUser!: User
  profileForm: UntypedFormGroup = null
  sending = false

  editorConfig = customAngularEditorConfig()

  skillTagsList: string[] = []
  tagSelectionInvalid = false
  acceptedTags: string[] = []
  tagInput = ''

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  onClose() {
    this.visible = false
  }

  buildForm() {
    this.profileForm = this.formBuilder.group({
      skillTags: [''],
      description: [this.currentUser?.description || ''],
    })
  }

  skillTagsUpdated(value: string) {
    this.profileForm.controls['skillTags'].setValue(value)
  }

  onSave(event: Event) {
    event.preventDefault()
    this.sending = true

    let tags: string[] =
      this.profileForm.value.skillTags === ''
        ? []
        : this.profileForm.value.skillTags.split(',').map((item) => item.trim())
    if (tags.length > 20) {
      tags = tags.slice(0, 20)
    }

    const tmpUser = {
      skillTags: tags,
      description: this.profileForm.value.description,
    }

    // console.log('tmpUser ======>', tmpUser)

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.currentUser[k] = tmpUser[k]
    }

    // console.log('this.currentUser', this.currentUser)

    this.userService.saveUser(this.currentUser)
    this.authService.setUser(this.currentUser)

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        // DESTROY the edit overlay
        this.onClose()
        this.sending = false
      }, 600)
    } else {
      this.onClose()
      this.sending = false
    }
  }

  stripHtmlTagslength(html: string): number {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent.length
  }
}
