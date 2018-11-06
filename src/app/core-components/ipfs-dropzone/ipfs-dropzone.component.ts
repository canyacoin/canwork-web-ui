import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DropzoneComponent as Dropzone } from 'ngx-dropzone-wrapper';

import { Buffer } from 'buffer';
import * as streamBuffers from 'stream-buffers';
import * as ipfsAPI from 'ipfs-api';

const ipfs = ipfsAPI({ host: 'ipfs.infura.io', port: '5001', protocol: 'https' })

@Component({
  selector: 'app-ipfs-dropzone',
  templateUrl: './ipfs-dropzone.component.html',
  styleUrls: ['./ipfs-dropzone.component.scss']
})
export class IpfsDropzoneComponent implements OnInit {

  @ViewChild(Dropzone) dropzone: Dropzone

  @Output() ipfsResponse = new EventEmitter
  @Output() close = new EventEmitter

  dropzoneConfig: any = {}
  errors: any = {}
  @Input() set config(config) {
    this.errors = config
    Object.keys(config).forEach(key => {
      this.dropzoneConfig[key] = config[key].value
    })
  }

  dropzoneMessage = `<i class='fa fa-cloud-upload-alt'></i> <h4>Drag a document to upload</h4> <p>- or -</p> <span class='btn btn-primary'>Browse</span>`
  errorMessage: string
  hasError = false

  file = {
    isUploading: false,
    name: null,
    type: null,
    size: null,
    progress: 0,
    pctg: '0%',
  }

  constructor() { }

  ngOnInit() { }

  onUploadError($evt) {
    console.log($evt);
  }

  onUploadSuccess(file) {
    console.log(file);
  }

  upload(fileContent) {
    this.file.isUploading = true

    const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
      chunkSize: 25000
    })

    const stream = ipfs.addReadableStream()

    stream.on('data', (ipfsResponse) => {
      console.log(ipfsResponse)
      this.file.isUploading = false
      this.file.pctg = '100%'
      this.ipfsResponse.emit(ipfsResponse)
    })

    myReadableStreamBuffer.on('data', (chunk) => {
      this.file.progress += chunk.byteLength
      this.file.pctg = (this.file.progress >= this.file.size) ? '98%' : `${(this.file.progress / this.file.size) * 100}%`
      myReadableStreamBuffer.resume()
    });

    stream.write(myReadableStreamBuffer)

    myReadableStreamBuffer.put(Buffer.from(fileContent))
    myReadableStreamBuffer.stop()

    myReadableStreamBuffer.on('end', () => {
      stream.end()
    });

    myReadableStreamBuffer.resume()
  }

  onFileAdded(file) {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (this.dropzoneConfig && this.dropzoneConfig.acceptedFiles) {
        if (!this.dropzoneConfig.acceptedFiles.includes(file.type)) {
          this.hasError = true
          this.errorMessage = this.errors.acceptedFiles.error
          return false
        }
      }

      if (this.dropzoneConfig && this.dropzoneConfig.maxFilesize) {
        if (file.size > this.dropzoneConfig.maxFilesize) {
          this.hasError = true
          this.errorMessage = this.errors.maxFilesize.error
          return false
        }
      }

      this.hasError = false
      this.errorMessage = ''

      this.file = {
        isUploading: false,
        name: file.name,
        type: file.type,
        size: file.size,
        progress: 0,
        pctg: '0%',
      }
      this.upload(reader.result)
    }
    reader.readAsArrayBuffer(file)
  }
}
