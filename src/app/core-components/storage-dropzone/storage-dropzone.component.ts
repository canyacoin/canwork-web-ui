import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import { DropzoneComponent as Dropzone } from 'ngx-dropzone-wrapper'

import { Observable } from 'rxjs'

@Component({
  selector: 'app-storage-dropzone',
  templateUrl: './storage-dropzone.component.html',
  styleUrls: ['./storage-dropzone.component.scss'],
})
export class StorageDropzoneComponent {
  @ViewChild(Dropzone) dropzone: Dropzone

  dropzoneConfig: any = {}
  errors: any = {}

  @Output() close = new EventEmitter()
  @Output() uploaded = new EventEmitter()

  @Input() set config(config) {
    this.errors = config
    Object.keys(config).forEach(key => {
      this.dropzoneConfig[key] = config[key].value
    })
    console.log('dropzone config', this.dropzoneConfig)
  }
  @Input() filePath: string

  dropzoneMessage = `<i class='fa fa-cloud-upload-alt'></i> <h4>Drag a document to upload</h4> <p>- or -</p> <span class='btn btn-primary'>Browse</span>`
  errorMessage: string

  isUploading = false
  uploadPercent: Observable<number>
  constructor(private storage: AngularFireStorage) {}

  uploadFile(file) {
    const filePath = this.filePath
    const task = this.storage.upload(filePath, file)

    // isUploading
    this.isUploading = true
    task
      .then(snap => {
        snap.ref.getDownloadURL().then(url => {
          this.uploaded.emit(url)
        })
        this.isUploading = false
      })
      .catch(err => {
        this.errorMessage = err.message
        this.isUploading = false
      })

    // observe percentage changes
    this.uploadPercent = task.percentageChanges()
  }

  onDropzoneError(event) {
    console.log(event)
  }

  onDropzoneSuccess(event) {
    console.log(event)
  }
}
