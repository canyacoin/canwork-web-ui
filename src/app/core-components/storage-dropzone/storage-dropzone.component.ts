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
import { finalize } from 'rxjs/operators'

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
  }

  @Input() filePath: string

  dropzoneMessage = `<i class='fa fa-cloud-upload-alt'></i> <h4>Drag a document to upload</h4> <p>- or -</p> <span class='btn btn-primary'>Browse</span>`
  errorMessage: string
  hasError = false

  isUploading = false
  uploadPercent: Observable<number>
  downloadURL: Observable<string>
  constructor(private storage: AngularFireStorage) {}

  uploadFile(event) {
    const file = event.target.files[0]
    const filePath = this.filePath
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file)

    // isUploading
    this.isUploading = true
    task.then(() => {
      this.isUploading = false
    })

    // observe percentage changes
    this.uploadPercent = task.percentageChanges()
    // get notified when the download URL is available
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.uploaded.emit(fileRef.getDownloadURL())
          this.downloadURL = fileRef.getDownloadURL()
        })
      )
      .subscribe()
  }

  onUploadError(event) {
    console.log(event)
  }

  onUploadSuccess(event) {
    console.log(event)
  }
}
