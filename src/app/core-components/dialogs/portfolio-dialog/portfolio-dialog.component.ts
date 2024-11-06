import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UntypedFormBuilder, Validators } from '@angular/forms'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs/operators'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user' 

@Component({ selector: 'portfolio-dialog', templateUrl: './portfolio-dialog.component.html' })
export class PortfolioDialogComponent {
  private _visible: boolean

  @Input() get visible(): boolean {
    return this._visible
  }

  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }

  @Output() visibleChange = new EventEmitter<boolean>()
  @Input() selectedPortfolio: any | null = null

  filePath: string
  selectedCoverImage: File | null = null
  selectedCoverImageUrl: string | ArrayBuffer
  selectedAttachments: File[] = []
  uploadedFiles: { name: string; progress: number; status: string }[] = []

  currentUser: User | null = null
  portfolioForm: any
  updatedTags: string[] = []

  constructor(private formBuilder: UntypedFormBuilder, private storage: AngularFireStorage, private auth: AuthService) {}

  ngOnInit() {
    this.auth.currentUser$.subscribe((user: User) => {
      if (user) {
        this.currentUser = user
        this.filePath = `uploads/workhistorys/${this.currentUser.address}`
        console.log('File path set:', this.filePath)
      }
    })

    this.buildForm()
  }

  buildForm() {
    this.selectedCoverImage = null
    this.selectedAttachments = []
    this.updatedTags = []

    this.portfolioForm = this.formBuilder.group({
      coverImageUrl: [''],
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      projectUrl: ['', Validators.required],
      tags: [[], Validators.required],
      attachments: [[], Validators.required],
    })
  }

  detectFiles(event: Event, type: string) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      if (type === 'coverImage') {
        const file = input.files[0]
        this.readFile(file, 'coverImage')
      } else if (type === 'attachments') {
        this.selectedAttachments = Array.from(input.files)
        this.uploadAttachments(this.selectedAttachments)
      }
    }
  }

  readFile(file: File, type: string) {
    const reader = new FileReader()
    reader.onload = () => {
      if (type === 'coverImage') {
        this.selectedCoverImageUrl = reader.result
        this.selectedCoverImage = file
      }
    }
    reader.readAsDataURL(file)
  }

  uploadAttachments(files: File[]) {
    if (!this.filePath) {
      console.error('File path not set, cannot upload attachments.')
      return
    }

    for (const file of files) {
      const fileTask = this.storage.upload(`${this.filePath}/${file.name}`, file)
      this.uploadedFiles.push({
        name: file.name,
        progress: 0,
        status: 'uploading',
      })

      fileTask.percentageChanges().subscribe((progress) => {
        const fileIndex = this.uploadedFiles.findIndex((uploadedFile) => uploadedFile.name === file.name)
        if (fileIndex !== -1) {
          this.uploadedFiles[fileIndex].progress = progress
        }
      })

      fileTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const downloadUrl = await (await fileTask).ref.getDownloadURL()
            const fileIndex = this.uploadedFiles.findIndex((uploadedFile) => uploadedFile.name === file.name)
            if (fileIndex !== -1) {
              this.uploadedFiles[fileIndex].status = 'success'
            }
          })
        )
        .subscribe()
    }
  }

  skillTagsUpdated(value: string) {
    let tags: string[] = value.split(',').map((item) => item.trim())
    this.portfolioForm.controls['tags'].setValue(tags)
  }

  async onSave(event: Event) {
    event.preventDefault()

    const tempPortfolio = {
      coverImageUrl: '',
      projectName: this.portfolioForm.value.projectName,
      projectDescription: this.portfolioForm.value.projectDescription,
      projectUrl: this.portfolioForm.value.projectUrl,
      tags: this.portfolioForm.value.tags,
      attachments: this.uploadedFiles.filter((file) => file.status === 'success').map((file) => ({ name: file.name })),
    }

    if (this.selectedCoverImage) {
      const coverTask = this.storage.upload(`${this.filePath}/portfolio/cover/${tempPortfolio.projectName}`, this.selectedCoverImage)

      coverTask.percentageChanges().subscribe((progress) => {
        console.log('Cover Image Progress:', progress)
      })

      await coverTask
        .snapshotChanges()
        .pipe(
          finalize(async () => {
            const downloadUrl = await (await coverTask).ref.getDownloadURL()
            tempPortfolio.coverImageUrl = downloadUrl
            console.log(`Cover Image uploaded: URL: ${downloadUrl}`)
          })
        )
        .toPromise()
    }
    this.visible = false
  }

  getDialogHeader() {
    return this.selectedPortfolio ? 'Edit Portfolio' : 'Add Portfolio'
  }

  onClose() {
    this.visible = false
  }

  removeAttachment(index: number): void {
    this.uploadedFiles.splice(index, 1)
  }
}
