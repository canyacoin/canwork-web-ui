import { Component, EventEmitter, Input, Output } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs/operators'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'
import { customAngularEditorConfig } from 'app/core-functions/angularEditorConfig'
import { AngularFirestore } from '@angular/fire/compat/firestore'

type PortfolioItem = {
  coverImageUrl: string
  projectName: string
  projectDescription: string
  projectUrl: string
  tags: string[]
  attachments: string[]
}

@Component({
  selector: 'portfolio-dialog',
  templateUrl: './portfolio-dialog.component.html',
})
export class PortfolioDialogComponent {
  private _visible: boolean
  filePath: string
  selectedCoverImage: File | null = null
  selectedCoverImageUrl: string | ArrayBuffer
  selectedAttachments: File[] = []
  uploadedFiles: { name: string; progress: number; status: string; url: string }[] = []
  currentUser: User | null = null
  portfolioForm: UntypedFormGroup
  updatedTags: string[] = []
  isDragging = false
  editorConfig = customAngularEditorConfig()
  maxFileSizeMB = 25
  maxAttachments = 10
  attachmentErrorMessage = ''

  @Output()
  visibleChange = new EventEmitter<boolean>()

  @Input()
  selectedPortfolio: any | null = null

  @Input()
  get visible() {
    return this._visible
  }

  set visible(value: boolean) {
    this._visible = value
    if (value) {
      this.reset()
    }
    this.visibleChange.emit(this._visible)
  }

  reset() {
    this.portfolioForm.reset()
    this.selectedCoverImage = null
    this.selectedCoverImageUrl = null
    this.selectedAttachments = []
    this.uploadedFiles = []
    this.updatedTags = []
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storage: AngularFireStorage,
    private auth: AuthService,
    private afs: AngularFirestore
  ) {}

  validateAttachments(newFiles: File[]): string {
    const totalFiles = this.selectedAttachments.length + newFiles.length
    if (totalFiles > this.maxAttachments) {
      return `You can only add up to ${this.maxAttachments} files with a maximum size of ${this.maxFileSizeMB}MB each.`
    }
    const oversizedFiles = newFiles.filter((file) => file.size / (1024 * 1024) > this.maxFileSizeMB)
    if (oversizedFiles.length > 0) {
      return `Each file must be under ${this.maxFileSizeMB}MB. Please remove any large files and try again.`
    }
    return ''
  }

  ngOnInit() {
    this.auth.currentUser$.subscribe((user: User) => {
      if (user) {
        this.currentUser = user
        this.filePath = `uploads/portfolios/${this.currentUser.address}`
      }
    })
    this.buildForm()
  }

  buildForm() {
    this.selectedCoverImage = null
    this.selectedAttachments = []
    this.updatedTags = []
    this.portfolioForm = this.formBuilder.group({
      coverImageUrl: ['', Validators.required],
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      projectUrl: ['', Validators.required],
      tags: [[], Validators.required],
      attachments: [[], Validators.required],
    })
  }

  onDragOver(event: DragEvent) {
    event.preventDefault()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault()
    this.isDragging = false
  }

  onDrop(event: DragEvent) {
    event.preventDefault()
    this.isDragging = false

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const newFiles = Array.from(event.dataTransfer.files)
      this.attachmentErrorMessage = this.validateAttachments(newFiles)
      if (this.attachmentErrorMessage) return
      this.selectedAttachments.push(...newFiles)
      this.uploadAttachments(newFiles)
      event.dataTransfer.clearData()
    }
  }

  onProgressComplete(fileIndex: number): void {
    this.uploadedFiles[fileIndex].status = 'success'
  }

  skillTagsUpdated(value: string) {
    let tags: string[] = value.split(',').map((item) => item.trim())
    this.portfolioForm.controls['tags'].setValue(tags)
  }

  getDialogHeader() {
    return this.selectedPortfolio ? 'Edit Portfolio' : 'Add Portfolio'
  }

  onClose() {
    this.visible = false
  }

  ngDoCheck() {
    const strippedTextLength = this.stripHtmlTags(this.portfolioForm?.value.projectDescription).length
    const error = strippedTextLength < 10 || strippedTextLength > 2500 ? { lengthInvalid: true } : null
    this.portfolioForm?.controls['projectDescription'].setErrors(error)
    this.portfolioForm?.controls['projectDescription'].updateValueAndValidity()
  }

  removeAttachment(index: number): void {
    this.uploadedFiles.splice(index, 1)
  }

  detectFiles(event: Event, type: string) {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length) {
      if (type === 'coverImage') {
        const file = input.files[0]
        this.readFile(file, 'coverImage')
      } else if (type === 'attachments') {
        const newFiles = Array.from(input.files)
        this.attachmentErrorMessage = this.validateAttachments(newFiles)
        if (this.attachmentErrorMessage) return
        this.selectedAttachments.push(...newFiles)
        this.uploadAttachments(newFiles)
      }
    }
  }

  readFile(file: File, type: string) {
    const reader = new FileReader()
    reader.onload = () => {
      if (type === 'coverImage') {
        this.selectedCoverImageUrl = reader.result
        this.selectedCoverImage = file
        this.portfolioForm.controls['coverImageUrl'].setValue(reader.result)
        this.portfolioForm.controls['coverImageUrl'].updateValueAndValidity()
      }
    }
    reader.readAsDataURL(file)
  }

  async uploadAttachments(files: File[]) {
    if (!this.filePath) {
      console.error('File path not set, cannot upload attachments.')
      return
    }

    for (const file of files) {
      const fileTask = this.storage.upload(`${this.filePath}`, file)
      const data = { name: file.name, progress: 0, status: 'uploading', url: '' }
      this.uploadedFiles.push(data)

      const fileData = await fileTask.snapshotChanges().toPromise()
      const url = await fileData.ref.getDownloadURL()
      data.url = url
      data.status = 'success'

      fileTask.percentageChanges().subscribe((progress) => (data.progress = progress))
      fileTask
        .snapshotChanges()
        .pipe(
          finalize(() => {
            this.portfolioForm.controls['attachments'].setValue(this.uploadedFiles)
            this.portfolioForm.controls['attachments'].updateValueAndValidity()
          })
        )
        .subscribe()
    }
  }

  async onSave(event: Event) {
    event.preventDefault()
    const tempPortfolio = {
      coverImageUrl: '',
      projectName: this.portfolioForm.value.projectName,
      projectDescription: this.portfolioForm.value.projectDescription,
      projectUrl: this.portfolioForm.value.projectUrl,
      tags: this.portfolioForm.value.tags,
      attachments: this.uploadedFiles.filter((file) => file.status === 'success').map((file) => file.url),
    }

    if (this.selectedCoverImage) {
      const coverTask = this.storage.upload(`${this.filePath}`, this.selectedCoverImage)
      const task = await coverTask.snapshotChanges().toPromise()
      tempPortfolio.coverImageUrl = await task.ref.getDownloadURL()
    }
    await this.addPortfolioItem(tempPortfolio)
    this.reset()
    this.visible = false
  }

  async addPortfolioItem(data: PortfolioItem) {
    try {
      const userAddress = this.currentUser.address
      await this.afs.collection(`portfolio/${userAddress}/work`).doc().set(data)
      console.log('Portfolio item added successfully!')
    } catch (error) {
      console.error('Error adding portfolio item: ', error)
    }
  }

  stripHtmlTags(html: string) {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent
  }
}
