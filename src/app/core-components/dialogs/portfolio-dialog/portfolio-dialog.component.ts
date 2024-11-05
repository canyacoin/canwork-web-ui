import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'

@Component({
  selector: 'portfolio-dialog',
  templateUrl: './portfolio-dialog.component.html',
})
export class PortfolioDialogComponent {
  portfolioForm: FormGroup
  selectedFile: File | null = null
  selectedFileUrl: string | ArrayBuffer | null = null
  updatedTags: string[] = []
  private _visible: boolean

  @Input()
  get visible(): boolean {
    return this._visible
  }

  set visible(value: boolean) {
    this._visible = value
    this.visibleChange.emit(this._visible)
  }

  @Output() visibleChange = new EventEmitter<boolean>()

  @Input() selectedPortfolio = {}
  constructor(private fb: FormBuilder) {
    this.portfolioForm = this.fb.group({
      projectName: ['', Validators.required],
      projectDescription: [
        '',
        [Validators.required, Validators.maxLength(2500)],
      ],
      tags: ['', Validators.required],
      projectUrl: [
        '',
        Validators.pattern(/https?:\/\/(www\.)?[a-zA-Z0-9-]+\.[a-z]{2,}/),
      ],
      attachments: [null],
    })
  }

  getDialogHeader() {
    if (this.selectedPortfolio) {
      return 'Add Work Experience'
    } else {
      return 'Edit Work Experience'
    }
  }

  detectFiles(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0]

      const reader = new FileReader()
      reader.onload = (e) => (this.selectedFileUrl = e.target?.result)
      reader.readAsDataURL(this.selectedFile)
    }
  }

  openDialog(): void {
    this.visible = true
  }

  onClose(): void {
    this.visible = false
    this.resetForm()
  }

  onSave(event: Event): void {
    event.preventDefault()
    if (this.portfolioForm.valid) {
      const formData = new FormData()
      formData.append('projectName', this.portfolioForm.value.projectName)
      formData.append(
        'projectDescription',
        this.portfolioForm.value.projectDescription
      )
      formData.append('tags', this.updatedTags.join(','))
      formData.append('projectUrl', this.portfolioForm.value.projectUrl || '')

      if (this.selectedFile) {
        formData.append('attachments', this.selectedFile)
      }

      console.log('Form Data:', formData)

      this.onClose()
    } else {
      console.log('Form is invalid')
    }
  }

  resetForm(): void {
    this.portfolioForm.reset()
    this.selectedFile = null
    this.selectedFileUrl = null
    this.updatedTags = []
  }

  skillTagsUpdated(tags: string[]): void {
    this.updatedTags = tags
    this.portfolioForm.get('tags')?.setValue(tags.join(','))
  }
}
