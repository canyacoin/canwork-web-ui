import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { AngularFireStorage } from '@angular/fire/storage'
import {
  DropzoneComponent as Dropzone,
  DropzoneConfigInterface,
} from 'ngx-dropzone-wrapper'

import { Observable } from 'rxjs'

@Component({
  selector: 'app-storage-dropzone',
  templateUrl: './storage-dropzone.component.html',
  styleUrls: ['./storage-dropzone.component.scss'],
})
export class StorageDropzoneComponent {
  @ViewChild(Dropzone) dropzone: Dropzone

  @Output() close = new EventEmitter()
  @Output() uploaded = new EventEmitter()

  @Input() dropzoneConfig: DropzoneConfigInterface
  @Input() filePath: string

  dropzoneMessage = `<i class='fa fa-cloud-upload-alt'></i> <h4>Drag a document to upload</h4> <p>- or -</p> <span class='btn btn-primary'>Browse</span>`
  errorMessage: string

  isUploading = false
  uploadPercent: Observable<number>
  constructor(private storage: AngularFireStorage) {}

  uploadFile(file: File) {
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
    console.log('onDropzoneError', event)
    this.errorMessage = event[1]
  }

  onDropzoneAddedFile(file) {
    // the method will be called before `onDropzoneError`
    this.errorMessage = ''
    console.log('onDropzoneAddedFile', file)
    // hack waiting file.accepted property
    setTimeout(() => {
      console.log(file.accepted)
      if (file.accepted) {
        console.log('file accepted')
        this.uploadFile(file)
      } else {
        console.log('file not accepted')
      }
    }, 0)
  }
}
