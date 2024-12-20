import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core'
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { finalize } from 'rxjs/operators'
import { AuthService } from '@service/auth.service'
import { User } from '@class/user'
import { customAngularEditorConfig } from 'app/core-functions/angularEditorConfig'
import { AngularFirestore } from '@angular/fire/compat/firestore'

type PortfolioItem = {
  id: string
  coverImageUrl: string
  projectName: string
  projectDescription: string
  projectUrl: string
  tags: string[]
  attachments: { name: string; url: string }[]
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
  tagsErrorMessage = ''
  isSaving = false

  @Output()
  visibleChange = new EventEmitter<boolean>()

  @Input() selectedPortfolio: any | null = undefined

  @Input()
  get visible() {
    return this._visible
  }

  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }

  constructor(
    private formBuilder: UntypedFormBuilder,
    private storage: AngularFireStorage,
    private auth: AuthService,
    private afs: AngularFirestore
  ) {}

  reset() {
    this.selectedCoverImage = null
    this.selectedCoverImageUrl = null
    this.selectedAttachments = []
    this.uploadedFiles = []
    this.updatedTags = []
    this.selectedPortfolio = undefined
    this.portfolioForm?.reset()
  }

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
        this.filePath = `uploads/workhistorys/${this.currentUser.address}`
      }
    })
    this.buildForm()
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedPortfolio && this.visible === true) {
      if (changes.selectedPortfolio?.currentValue) {
        this.portfolioForm.controls.id = this.selectedPortfolio.id
        this.portfolioForm.controls.coverImageUrl.setValue(this.selectedPortfolio.coverImageUrl)
        this.portfolioForm.controls.projectName.setValue(this.selectedPortfolio.projectName)
        this.portfolioForm.controls.projectDescription.setValue(this.selectedPortfolio.projectDescription)
        this.portfolioForm.controls.projectUrl.setValue(this.selectedPortfolio.projectUrl)
        this.portfolioForm.controls.tags.setValue(this.selectedPortfolio.tags)
        this.portfolioForm.controls.attachments.setValue(this.selectedPortfolio.attachments)
        this.updatedTags = this.selectedPortfolio.tags
        this.uploadedFiles = this.selectedPortfolio.attachments
      } else {
        this.buildForm()
      }
    }
  }

  buildForm() {
    this.selectedCoverImage = null
    this.selectedAttachments = []
    this.updatedTags = []
    this.selectedCoverImageUrl = null
    this.uploadedFiles = []
    this.portfolioForm = this.formBuilder.group({
      coverImageUrl: ['', Validators.required],
      projectName: ['', Validators.required],
      projectDescription: ['', Validators.required],
      projectUrl: ['', Validators.required],
      tags: [[], Validators.required],
      attachments: [],
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
    if (tags.length > 10) {
      this.tagsErrorMessage = 'You can choose only 10 tags'
    }
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
      const fileTask = this.storage.upload(`${this.filePath}/${this.idGenerator()}`, file)
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

    this.isSaving = true

    const tempPortfolio = {
      id: this.selectedPortfolio?.id ?? this.idGenerator(),
      coverImageUrl: this.selectedPortfolio?.coverImageUrl ?? '',
      projectName: this.portfolioForm.value.projectName,
      projectDescription: this.portfolioForm.value.projectDescription,
      projectUrl: this.portfolioForm.value.projectUrl,
      tags: this.portfolioForm.value.tags,
      attachments: this.uploadedFiles
        .filter((file) => file.status === 'success')
        .map((file) => ({ url: file.url, name: file.name, status: file.status })),
    }

    try {
      if (this.selectedCoverImage) {
        const coverTask = this.storage.upload(`${this.filePath}/${tempPortfolio.id}`, this.selectedCoverImage)
        const task = await coverTask.snapshotChanges().toPromise()
        tempPortfolio.coverImageUrl = await task.ref.getDownloadURL()
      }

      if (this.selectedPortfolio) {
        await this.updatePortfolioItem(tempPortfolio)
      } else {
        await this.addPortfolioItem(tempPortfolio)
      }

      this.visible = false
    } catch (error) {
      console.error('Error saving portfolio item: ', error)
    } finally {
      this.isSaving = false
      // this.reset()
    }
  }

  async addPortfolioItem(data: PortfolioItem) {
    try {
      const userAddress = this.currentUser.address
      await this.afs.doc(`portfolio/${userAddress}/work/${data.id}`).set(data)
    } catch (error) {
      console.error('Error adding portfolio item: ', error)
    }
  }

  async updatePortfolioItem(data: PortfolioItem) {
    try {
      const userAddress = this.currentUser.address
      await this.afs.doc(`portfolio/${userAddress}/work/${data.id}`).update(data)
    } catch (error) {
      console.error('Error updating portfolio item: ', error)
    }
  }

  stripHtmlTags(html: string) {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent
  }

  async deleteAll() {
    const userAddress = this.currentUser.address
    const data = await this.afs.collection(`portfolio/${userAddress}/work`).get().toPromise()
    data.docs.forEach((doc) => {
      doc.ref.delete()
    })
  }

  idGenerator(): string {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    }
    return s4() + '-' + s4() + '-' + s4() + '-' + s4()
  }
}
