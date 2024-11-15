import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Inject,
  PLATFORM_ID,
} from '@angular/core'
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { User } from '@class/user'
import { AuthService } from '@service/auth.service'
import { UserService } from '@service/user.service'
import { CurrencyValidator } from '@validator/currency.validator'
import { EmailValidator } from '@validator/email.validator'
import { AngularFireStorage } from '@angular/fire/compat/storage'

import * as moment from 'moment-timezone'

import { BscValidator } from '@validator/bsc.validator'
import { BscService } from '@service/bsc.service'

import { isPlatformBrowser, isPlatformServer } from '@angular/common'

interface DropdownItem {
  name: string
  code: string
  img: string
}

@Component({
  selector: 'edit-profile-dialog',
  templateUrl: './edit-profile-dialog.component.html',
})
export class EditProfileDialogComponent implements OnInit, OnDestroy {
  // two way data binding
  private _visible: boolean
  @Input()
  get visible(): boolean {
    return this._visible
  }
  set visible(value: boolean) {
    this._visible = value
    this.initFunction()
    this.visibleChange.emit(this._visible)
  }
  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() currentUser: User

  @Output() close = new EventEmitter()
  filePath: string

  isUploading: boolean = false
  selectedFile: File | null = null
  selectedFileUrl: string | ArrayBuffer

  profileForm: UntypedFormGroup = null
  sending = false

  skillTagsList: string[] = []
  tagSelectionInvalid = false
  acceptedTags: string[] = []
  tagInput = ''

  bscAddress: string

  categories: DropdownItem[] | undefined
  selectedCategory: DropdownItem | undefined

  constructor(
    private formBuilder: UntypedFormBuilder,
    private userService: UserService,
    private bscService: BscService,
    private authService: AuthService,
    private storage: AngularFireStorage,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.categories = [
      {
        name: 'Content Creators',
        img: 'writer.png',
        code: 'contentCreator',
      },
      {
        name: 'Software Developers',
        img: 'dev.png',
        code: 'softwareDev',
      },
      {
        name: 'Designers & Creatives',
        img: 'creatives.png',
        code: 'designer',
      },
      {
        name: 'Marketing & SEO',
        img: 'marketing.png',
        code: 'marketing',
      },
      {
        name: 'Virtual Assistants',
        img: 'assistant.png',
        code: 'virtualAssistant',
      },
    ]
    this.initFunction()
  }

  ngOnDestroy() {}

  setProviderType(item: DropdownItem) {
    this.selectedCategory = item
  }

  onClose() {
    this.close.emit(true)
  }

  initFunction() {
    this.buildForm()
    this.selectedFile = null
    if (this.currentUser) {
      this.filePath = `uploads/avatars/${this.currentUser.address}`
      // console.log('this.filePath', this.filePath)
      // set selectedCategory
      let categoryIndex = this.categories.findIndex(
        (item) =>
          item.name.toLowerCase() === this.currentUser.category.toLowerCase()
      )
      this.selectedCategory = this.categories[categoryIndex]
    }
  }

  buildForm() {
    this.profileForm = this.formBuilder.group({
      name: [
        this.currentUser?.name || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(36),
        ]),
      ],
      title: [
        this.currentUser?.title || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(36),
        ]),
      ],
      bio: [
        this.currentUser?.bio || '',
        Validators.compose([
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
        ]),
      ],
      category: [this.currentUser?.category || ''],
      hourlyRate: [
        this.currentUser?.hourlyRate || '',
        Validators.compose([
          CurrencyValidator.isValid,
          Validators.max(999),
          Validators.min(0),
        ]),
      ],
      bscAddress: [
        this.currentUser?.bscAddress || this.bscAddress,
        () => null,
        Validators.composeAsync([
          new BscValidator(this.bscService, this.userService)
            .isValidAddressField,
          new BscValidator(
            this.bscService,
            this.userService
          ).isUniqueAddressField(this.currentUser),
        ]),
      ],
      work: [
        this.currentUser?.work || '',
        Validators.compose([Validators.required, EmailValidator.isValid]),
      ],
      dribbble: [
        this.currentUser?.dribbble || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?(?:dribbble\.com\/(?:[a-zA-Z0-9_.]{1,32})?)$/
          ),
        ]),
      ],
      behance: [
        this.currentUser?.behance || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?(?:behance\.com\/(?:[a-zA-Z0-9_.]{1,32})?)$/
          ),
        ]),
      ],
      instagram: [
        this.currentUser?.instagram || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?(?:instagram\.com\/(?:[a-zA-Z0-9_.]{1,32})?)$/
          ),
        ]),
      ],
      facebook: [
        this.currentUser?.facebook || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?(?:facebook\.com\/(?:[a-zA-Z0-9_.]{1,32})?)$/
          ),
        ]),
      ],
      twitter: [
        this.currentUser?.twitter || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_.]{1,32})?$/
          ),
        ]),
      ],
      linkedin: [
        this.currentUser?.linkedin || '',
        Validators.compose([
          Validators.pattern(
            /^(?:http(s)?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]{3,30}$/
          ),
        ]),
      ],
      website: [
        this.currentUser?.website || '',
        Validators.compose([
          Validators.pattern(
            /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
          ),
        ]),
      ],
      weeklyAvailability: [
        this.currentUser?.weeklyAvailability || 0,
        Validators.compose([Validators.required, Validators.min(0)]),
      ],
      location: [this.currentUser?.location || ''],
      // skillTags: [''],
      // description: [this.currentUser?.description || ''],
    })
  }

  skillTagsUpdated(value: string) {
    this.profileForm.controls['skillTags'].setValue(value)
  }

  onSave(event: Event) {
    event.preventDefault()
    this.sending = true

    let category = this.selectedCategory.name

    // let tags: string[] =
    //   this.profileForm.value.skillTags === ''
    //     ? []
    //     : this.profileForm.value.skillTags.split(',').map((item) => item.trim())
    // if (tags.length > 6) {
    //   tags = tags.slice(0, 6)
    // }

    const tmpUser = {
      // address: this.currentUser.address,
      name: this.profileForm.value.name,
      work: this.profileForm.value.work,
      bscAddress: this.profileForm.value.bscAddress,
      title: this.profileForm.value.title,
      bio: this.profileForm.value.bio,
      category: category,
      // skillTags: tags,
      hourlyRate: this.profileForm.value.hourlyRate,
      // description: this.profileForm.value.description,
      dribbble: this.profileForm.value.dribbble,
      behance: this.profileForm.value.behance,
      instagram: this.profileForm.value.instagram,
      facebook: this.profileForm.value.facebook,
      twitter: this.profileForm.value.twitter,
      linkedin: this.profileForm.value.linkedin,
      website: this.profileForm.value.website,
      weeklyAvailability: this.profileForm.value.weeklyAvailability,
      location: this.profileForm.value.location,
      timezone: moment.tz.guess(),
    }

    // console.log('tmpUser ======>', tmpUser)

    // tslint:disable-next-line:forin
    for (const k in tmpUser) {
      this.currentUser[k] = tmpUser[k]
    }

    // console.log('this.currentUser', this.currentUser)

    this.userService.saveUser(this.currentUser)
    this.authService.setUser(this.currentUser)

    // Upload avatar image
    if (this.selectedFile !== null) {
      const task = this.storage.upload(this.filePath, this.selectedFile)

      // console.log('task:', task)

      // isUploading
      this.isUploading = true
      task
        .then((snap) => {
          snap.ref.getDownloadURL().then((url) => {
            this.currentUser = {
              ...this.currentUser,
              avatar: {
                ...this.currentUser.avatar,
                uri: url,
              },
            }
            this.userService.saveUser(this.currentUser)
          })
          this.isUploading = false
        })
        .catch((err) => {
          console.log('ErrorMessage:', err.message)
          this.isUploading = false
        })
    }

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

  detectFiles(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      const file = input.files[0]

      // Check if the file type is an image
      const validImageTypes = ['image/jpg', 'image/jpeg', 'image/png']
      if (!validImageTypes.includes(file.type)) {
        alert('Please select a valid image file (jpg, jpeg, or png).')
        return
      }

      // Check if the file size is under 4MB
      const maxSizeInMB = 4
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert('The selected file is too large. Please select a file under 4MB.')
        return
      }

      // If the file is valid, read it and set the selectedFile property
      const reader = new FileReader()

      reader.onload = () => {
        this.selectedFileUrl = reader.result
        this.selectedFile = file
      }

      reader.readAsDataURL(file)
    }
  }
}
